/**
 * Vista Pública SOC (/secure) — Renderizado seguro (DOM textContent) de /data/soc_public.json
 */
(function () {
  "use strict";

  let allAttackers = [];

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function renderDailyTable(byDay) {
    const tbody = document.getElementById("soc-daily-tbody");
    if (!tbody) return;
    tbody.replaceChildren();

    (byDay || []).forEach((row) => {
      const tr = document.createElement("tr");

      const tdDay = document.createElement("td");
      const strongDay = document.createElement("strong");
      strongDay.textContent = row.day + (row.day === "2026-11-17" ? " (desde 21h)" : "");
      tdDay.appendChild(strongDay);

      const tdHumans = document.createElement("td");
      const strongHumans = document.createElement("strong");
      strongHumans.textContent = String(row.humans);
      tdHumans.appendChild(strongHumans);

      const tdTest = document.createElement("td");
      tdTest.textContent = String(row.completed_test);

      const tdComp = document.createElement("td");
      tdComp.textContent = String(row.used_comparator);

      const tdAtt = document.createElement("td");
      tdAtt.textContent = row.attacks_blocked + " IPs";

      const tdReqs = document.createElement("td");
      tdReqs.textContent = row.attack_reqs + " reqs";

      tr.append(tdDay, tdHumans, tdTest, tdComp, tdAtt, tdReqs);
      tbody.appendChild(tr);
    });
  }

  function renderBars(containerId, items, labelKey, valueKey, subLabelFn, isAlt) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.replaceChildren();

    const maxVal = items.reduce((m, it) => Math.max(m, it[valueKey] || 0), 1);
    items.slice(0, 10).forEach((item) => {
      const row = document.createElement("div");
      row.className = "soc-bar-row";

      const head = document.createElement("div");
      head.className = "soc-bar-head";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = item[labelKey];

      const valSpan = document.createElement("span");
      valSpan.textContent = subLabelFn(item);

      head.append(nameSpan, valSpan);

      const track = document.createElement("div");
      track.className = "soc-bar-track";

      const fill = document.createElement("div");
      fill.className = isAlt ? "soc-bar-fill fill-alt" : "soc-bar-fill";
      const pct = Math.max(4, Math.round(((item[valueKey] || 0) / maxVal) * 100));
      fill.style.width = pct + "%";

      track.appendChild(fill);
      row.append(head, track);
      container.appendChild(row);
    });
  }

  function renderCidrs(cidrs) {
    const tbody = document.getElementById("soc-cidrs-tbody");
    if (!tbody) return;
    tbody.replaceChildren();

    (cidrs || []).forEach((c) => {
      const tr = document.createElement("tr");

      const tdCidr = document.createElement("td");
      const code = document.createElement("code");
      code.textContent = c.cidr;
      tdCidr.appendChild(code);

      const tdOrigin = document.createElement("td");
      tdOrigin.textContent = c.origin;

      const tdReason = document.createElement("td");
      tdReason.textContent = c.reason;

      tr.append(tdCidr, tdOrigin, tdReason);
      tbody.appendChild(tr);
    });
  }

  function renderAttackersTable(list) {
    const tbody = document.getElementById("soc-attackers-tbody");
    if (!tbody) return;
    tbody.replaceChildren();

    setText("soc-filter-count", "Mostrando " + list.length + " de " + allAttackers.length + " IPs");

    list.forEach((a, idx) => {
      const tr = document.createElement("tr");

      const tdIdx = document.createElement("td");
      tdIdx.textContent = String(idx + 1);

      const tdCountry = document.createElement("td");
      const strongC = document.createElement("strong");
      strongC.textContent = a.country || "Desconocido";
      tdCountry.appendChild(strongC);
      if (a.city && a.city !== "-") {
        const citySpan = document.createElement("span");
        citySpan.textContent = " (" + a.city + ")";
        tdCountry.appendChild(citySpan);
      }

      const tdIp = document.createElement("td");
      const ipCode = document.createElement("code");
      ipCode.textContent = a.ip;
      tdIp.appendChild(ipCode);

      const tdType = document.createElement("td");
      tdType.textContent = a.attack_type;

      const tdIsp = document.createElement("td");
      tdIsp.textContent = a.isp || "-";

      const tdTime = document.createElement("td");
      tdTime.textContent = a.last_seen || a.first_seen;

      const tdReqs = document.createElement("td");
      tdReqs.textContent = String(a.total_reqs);

      const tdPayload = document.createElement("td");
      const payloadCode = document.createElement("code");
      payloadCode.className = "soc-payload-code";
      payloadCode.textContent = a.sample_payload || "-";
      payloadCode.title = a.sample_payload || "-";
      tdPayload.appendChild(payloadCode);

      const tdStatus = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "soc-badge-drop";
      badge.textContent = a.action || "DROP + 444";
      tdStatus.appendChild(badge);

      tr.append(
        tdIdx,
        tdCountry,
        tdIp,
        tdType,
        tdIsp,
        tdTime,
        tdReqs,
        tdPayload,
        tdStatus
      );
      tbody.appendChild(tr);
    });
  }

  function applyFilters() {
    const qInput = document.getElementById("soc-search-input");
    const cSelect = document.getElementById("soc-country-filter");
    const tSelect = document.getElementById("soc-type-filter");

    const q = qInput ? qInput.value.trim().toLowerCase() : "";
    const country = cSelect ? cSelect.value : "";
    const atype = tSelect ? tSelect.value : "";

    const filtered = allAttackers.filter((a) => {
      if (country && a.country !== country) return false;
      if (atype && a.attack_type !== atype) return false;
      if (q) {
        const hay = [
          a.ip,
          a.country,
          a.city,
          a.isp,
          a.attack_type,
          a.sample_payload,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    renderAttackersTable(filtered);
  }

  function populateSelects(byCountry, byType) {
    const cSelect = document.getElementById("soc-country-filter");
    if (cSelect) {
      (byCountry || []).forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.country;
        opt.textContent = c.country + " (" + c.count + ")";
        cSelect.appendChild(opt);
      });
      cSelect.addEventListener("change", applyFilters);
    }

    const tSelect = document.getElementById("soc-type-filter");
    if (tSelect) {
      (byType || []).forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.type;
        opt.textContent = t.type + " (" + t.ips + ")";
        tSelect.appendChild(opt);
      });
      tSelect.addEventListener("change", applyFilters);
    }

    const qInput = document.getElementById("soc-search-input");
    if (qInput) {
      qInput.addEventListener("input", applyFilters);
    }
  }

  async function initSecureView() {
    try {
      const resp = await fetch("/data/soc_public.json?t=" + Math.floor(Date.now() / 60000), {
        cache: "no-store",
      });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();

      setText("soc-last-audit", "Último corte SOC: " + (data.last_audit_cet || "--") + " CET");

      const vis = data.visitors || {};
      const sec = data.security || {};

      setText("kpi-total-humans", vis.total_humans ?? "--");
      setText("soc-header-humans", vis.total_humans ?? "--");
      setText(
        "kpi-sub-humans",
        (vis.completed_test_bundle || 0) + " con test completo · 0 IPs expuestas"
      );

      setText("kpi-total-attackers", sec.total_attacker_ips ?? "--");
      setText("kpi-total-cidrs", sec.total_blocked_cidrs ?? "--");
      setText("kpi-total-reqs", sec.total_malicious_requests ?? "--");

      renderDailyTable(vis.by_day || []);

      renderBars(
        "soc-countries-bars",
        sec.by_country || [],
        "country",
        "count",
        (it) => it.count + " IPs (" + it.pct + "%)",
        false
      );

      renderBars(
        "soc-types-bars",
        sec.by_type || [],
        "type",
        "ips",
        (it) => it.ips + " IPs · " + it.reqs + " reqs",
        true
      );

      renderCidrs(sec.blocked_cidrs || []);

      allAttackers = sec.attackers || [];
      populateSelects(sec.by_country || [], sec.by_type || []);
      renderAttackersTable(allAttackers);
    } catch (err) {
      setText("soc-last-audit", "Error cargando /data/soc_public.json");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSecureView);
  } else {
    initSecureView();
  }
})();
