"""Bot de Telegram asíncrono (long-polling) con whitelist estricta desde .env."""

from __future__ import annotations

import asyncio
import logging
import httpx

from app.core.config import Settings
from app.core.security import sanitize_query
from app.services.rag_service import RAGService

logger = logging.getLogger("telegram_29n")


class TelegramBotWorker:
    def __init__(self, settings: Settings, rag: RAGService) -> None:
        self.settings = settings
        self.rag = rag
        self._task: asyncio.Task | None = None
        self._stop_event = asyncio.Event()
        self._base_url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"

    def start(self) -> None:
        if not self.settings.TELEGRAM_ENABLED or not self.settings.TELEGRAM_BOT_TOKEN:
            logger.info("Telegram Bot deshabilitado o sin token en .env.")
            return
        self._task = asyncio.create_task(self._poll_loop())

    async def stop(self) -> None:
        self._stop_event.set()
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _send_message(self, client: httpx.AsyncClient, chat_id: int, text: str) -> None:
        # Telegram limita mensajes a 4096 caracteres
        for i in range(0, len(text), 4000):
            await client.post(
                f"{self._base_url}/sendMessage",
                json={"chat_id": chat_id, "text": text[i : i + 4000]},
            )

    async def _handle_update(self, client: httpx.AsyncClient, update: dict) -> None:
        msg = update.get("message") or {}
        text = (msg.get("text") or "").strip()
        chat_id = (msg.get("chat") or {}).get("id")
        user_id = (msg.get("from") or {}).get("id")

        if not text or not chat_id or not user_id:
            return

        allowed = self.settings.telegram_allowed_ids
        if allowed and user_id not in allowed:
            await self._send_message(client, chat_id, "Acceso no autorizado. Este bot es privado.")
            return

        if text.startswith("/start"):
            await self._send_message(
                client,
                chat_id,
                "Consultor Electoral 29N activo. Pregunta sobre cualquier tema de los programas de PP, PSOE, VOX o Frente Amplio.",
            )
            return

        try:
            clean_q = sanitize_query(text, self.settings.MAX_QUERY_LENGTH)
        except Exception as exc:
            detail = getattr(exc, "detail", "Consulta rechazada por validación.")
            await self._send_message(client, chat_id, str(detail))
            return

        try:
            answer, sources = await self.rag.answer_once(clean_q)
            if sources:
                refs = ", ".join(
                    f"{s['party_id'].upper()} ({s['source_ref']})" for s in sources[:4]
                )
                answer = f"{answer}\n\nFuentes: {refs}"
            await self._send_message(client, chat_id, answer)
        except Exception:
            logger.exception("Error procesando consulta de Telegram")
            await self._send_message(client, chat_id, "Error temporal procesando tu consulta.")

    async def _poll_loop(self) -> None:
        offset = 0
        async with httpx.AsyncClient(timeout=35.0) as client:
            logger.info("Telegram Bot polling iniciado.")
            while not self._stop_event.is_set():
                try:
                    resp = await client.get(
                        f"{self._base_url}/getUpdates",
                        params={"timeout": 25, "offset": offset},
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    for upd in data.get("result", []):
                        offset = upd["update_id"] + 1
                        asyncio.create_task(self._handle_update(client, upd))
                except asyncio.CancelledError:
                    break
                except Exception as exc:
                    logger.warning("Error en polling Telegram: %s", exc)
                    await asyncio.sleep(5)
