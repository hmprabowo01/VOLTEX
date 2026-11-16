
const $ = id => document.getElementById(id);

let langkahTerakhir = [];

function showPage(page) {
    document.querySelectorAll(".page").forEach(el => {
        el.classList.toggle("active", el.id === page);
    });

    document.querySelectorAll(".nav-link").forEach(el => {
        el.classList.toggle("active", el.dataset.page === page);
    });

    const names = {
        dashboard: "Dashboard",
        calculation: "Perhitungan Kelistrikan",
        tools: "Electrical Tools"
    };

    $("breadcrumb").textContent = names[page];
    $("sidebar").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

$("menuToggle").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
});

function openCalculator(type) {
    const tools = ["steps", "converter"];
    const area = $(tools.includes(type) ? "toolsArea" : "calculatorArea");

    const forms = {
        dc: `
            <h2>Kalkulator Listrik DC</h2>
            <p>Pilih besaran listrik yang ingin dihitung.</p>
            <div class="field">
                <label>Variabel yang dicari</label>
                <select id="dcTarget">
                    <option value="v">Tegangan (V)</option>
                    <option value="i">Arus (I)</option>
                    <option value="r">Hambatan (R)</option>
                    <option value="p">Daya (P)</option>
                    <option value="e">Energi (E)</option>
                </select>
            </div>
            <div id="dcInputs" class="calc-grid"></div>
            <div class="calc-actions">
                <button class="primary-btn" onclick="calculateDC()">Hitung DC →</button>
                <button class="secondary-btn" onclick="openCalculator('dc')">Reset</button>
            </div>`,

        ac: `
            <h2>Kalkulator Listrik AC</h2>
            <p>Masukkan parameter arus bolak-balik.</p>
            <div class="calc-grid">
                ${field("Tegangan RMS (V)", "acV")}
                ${field("Arus RMS (A)", "acI")}
                ${field("Frekuensi (Hz)", "acF")}
                ${field("Power Factor (0-1)", "acPF")}
            </div>
            <div class="calc-actions">
                <button class="primary-btn" onclick="calculateAC()">Hitung AC →</button>
                <button class="secondary-btn" onclick="openCalculator('ac')">Reset</button>
            </div>`,

        circuit: `
            <h2>Kalkulator Rangkaian</h2>
            <p>Pilih konfigurasi rangkaian resistor.</p>
            <div class="field">
                <label>Jenis rangkaian</label>
                <select id="circuitType" onchange="circuitFields()">
                    <option value="1">Seri</option>
                    <option value="2">Paralel</option>
                    <option value="3">Campuran (R1 seri dengan R2 paralel R3)</option>
                </select>
            </div>
            <div id="circuitInputs" class="calc-grid"></div>
            <div class="calc-actions">
                <button class="primary-btn" onclick="calculateCircuit()">Hitung Rangkaian →</button>
                <button class="secondary-btn" onclick="openCalculator('circuit')">Reset</button>
            </div>`,

        phase: `
            <h2>Kalkulator Listrik 3 Fasa</h2>
            <p>Pilih metode perhitungan sistem tiga fasa.</p>
            <div class="field">
                <label>Metode perhitungan</label>
                <select id="phaseMode" onchange="phaseFields()">
                    <option value="1">Menghitung daya dari tegangan dan arus</option>
                    <option value="2">Menghitung arus dari daya aktif</option>
                </select>
            </div>
            <div id="phaseInputs" class="calc-grid"></div>
            <div class="calc-actions">
                <button class="primary-btn" onclick="calculatePhase()">Hitung 3 Fasa →</button>
                <button class="secondary-btn" onclick="openCalculator('phase')">Reset</button>
            </div>`,

        smart: `
            <h2>Smart Formula</h2>
            <p>Tentukan variabel yang ingin dicari dan masukkan nilai yang diketahui. Isi 0 jika tidak diketahui.</p>
            <div class="field">
                <label>Variabel yang dicari</label>
                <select id="smartTarget">
                    <option value="1">Tegangan (V)</option>
                    <option value="2">Arus (I)</option>
                    <option value="3">Hambatan (R)</option>
                    <option value="4">Daya (P)</option>
                </select>
            </div>
            <div class="calc-grid">
                ${field("Tegangan (V)", "smartV", "0")}
                ${field("Arus (A)", "smartI", "0")}
                ${field("Hambatan (Ohm)", "smartR", "0")}
                ${field("Daya (W)", "smartP", "0")}
            </div>
            <div class="calc-actions">
                <button class="primary-btn" onclick="calculateSmart()">Cari Variabel →</button>
                <button class="secondary-btn" onclick="openCalculator('smart')">Reset</button>
            </div>`,

        steps: `
            <h2>Step-by-Step</h2>
            <p>Menampilkan tahapan perhitungan terakhir yang telah dilakukan.</p>
            <div id="stepsResult" class="calc-result">
                ${stepsHTML()}
            </div>`,

        converter: `
            <h2>Unit Converter</h2>
            <p>Konversi satuan besaran listrik.</p>
            <div class="field">
                <label>Jenis konversi</label>
                <select id="convertType">
                    <option value="1">V ke kV</option>
                    <option value="2">kV ke V</option>
                    <option value="3">A ke mA</option>
                    <option value="4">mA ke A</option>
                    <option value="5">W ke kW</option>
                    <option value="6">kW ke W</option>
                    <option value="7">Ohm ke kOhm</option>
                    <option value="8">kOhm ke Ohm</option>
                </select>
            </div>
            <div class="field">
                <label>Nilai yang dikonversi</label>
                <input type="number" id="convertValue" placeholder="Masukkan nilai">
            </div>
            <div class="calc-actions">
                <button class="primary-btn" onclick="convertUnit()">Konversi →</button>
                <button class="secondary-btn" onclick="openCalculator('converter')">Reset</button>
            </div>`
    };

    area.innerHTML = `
        <div class="calculator">
            ${forms[type]}
            <div id="result" class="calc-result" style="display:none"></div>
        </div>
    `;

    if (type === "dc") dcFields();
    if (type === "circuit") circuitFields();
    if (type === "phase") phaseFields();
}

function field(label, id, placeholder = "Masukkan nilai") {
    return `
        <div class="field">
            <label>${label}</label>
            <input type="number" id="${id}" step="any"
                placeholder="${placeholder}">
        </div>
    `;
}

function getValue(id) {
    const value = $(id).value.trim();
    return value === "" ? NaN : Number(value);
}

function format(value) {
    return Number(value).toLocaleString("id-ID", {
        maximumFractionDigits: 4
    });
}

function showResult(title, lines) {
    langkahTerakhir = [title, ...lines];

    $("result").style.display = "block";
    $("result").innerHTML = `
        <h3>${title}</h3>
        ${lines.map(line => `<p class="step">${line}</p>`).join("")}
    `;
}

function showError(message) {
    $("result").style.display = "block";
    $("result").innerHTML = `<h3>Perhatian</h3><p>${message}</p>`;
}

function validNonNegative(...values) {
    return values.every(v => Number.isFinite(v) && v >= 0);
}

// ===================================
// 1. KALKULATOR DC
// ===================================

function dcFields() {
    const target = $("dcTarget").value;

    const inputs = {
        v: ["Arus (A)", "Hambatan (Ohm)"],
        i: ["Tegangan (V)", "Hambatan (Ohm)"],
        r: ["Tegangan (V)", "Arus (A)"],
        p: ["Tegangan (V)", "Arus (A)"],
        e: ["Daya (W)", "Waktu (jam)"]
    };

    const ids = {
        v: ["dcA", "dcB"],
        i: ["dcA", "dcB"],
        r: ["dcA", "dcB"],
        p: ["dcA", "dcB"],
        e: ["dcA", "dcB"]
    };

    $("dcInputs").innerHTML = inputs[target].map((label, index) =>
        field(label, ids[target][index])
    ).join("");
}

document.addEventListener("change", event => {
    if (event.target.id === "dcTarget") dcFields();
});

function calculateDC() {
    const target = $("dcTarget").value;
    const a = getValue("dcA");
    const b = getValue("dcB");

    if (!validNonNegative(a, b)) {
        return showError("Masukkan angka yang valid dan tidak negatif.");
    }

    let result, name, unit, formula;

    switch (target) {
        case "v":
            result = a * b;
            name = "Tegangan";
            unit = "V";
            formula = "V = I × R";
            break;

        case "i":
            if (b <= 0) return showError("Hambatan harus lebih dari nol.");
            result = a / b;
            name = "Arus";
            unit = "A";
            formula = "I = V / R";
            break;

        case "r":
            if (b <= 0) return showError("Arus harus lebih dari nol.");
            result = a / b;
            name = "Hambatan";
            unit = "Ohm";
            formula = "R = V / I";
            break;

        case "p":
            result = a * b;
            name = "Daya";
            unit = "W";
            formula = "P = V × I";
            break;

        case "e":
            result = a * b;
            name = "Energi";
            unit = "Wh";
            formula = "E = P × t";
            break;
    }

    showResult("Hasil Kalkulator DC", [
        `Rumus: ${formula}`,
        `Substitusi: ${a} dan ${b}`,
        `${name} = ${format(result)} ${unit}`
    ]);
}

// ===================================
// 2. KALKULATOR AC
// ===================================

function calculateAC() {
    const v = getValue("acV");
    const i = getValue("acI");
    const f = getValue("acF");
    const pf = getValue("acPF");

    if (!validNonNegative(v, i, f, pf) ||
        f <= 0 || pf > 1) {
        return showError("Periksa input. Frekuensi harus lebih dari nol dan PF berada pada 0–1.");
    }

    const periode = 1 / f;
    const impedansi = i > 0 ? v / i : 0;
    const dayaAktif = v * i * pf;
    const dayaSemu = v * i;
    const dayaReaktif = dayaSemu * Math.sqrt(1 - pf ** 2);

    showResult("Hasil Kalkulator AC", [
        `Periode: T = 1 / f = ${format(periode)} s`,
        `Impedansi: Z = V / I = ${format(impedansi)} Ohm`,
        `Daya aktif: P = V × I × PF = ${format(dayaAktif)} W`,
        `Daya semu: S = V × I = ${format(dayaSemu)} VA`,
        `Daya reaktif: Q = S × √(1 - PF²) = ${format(dayaReaktif)} VAR`
    ]);
}

// ===================================
// 3. KALKULATOR RANGKAIAN
// ===================================

function circuitFields() {
    const type = $("circuitType").value;

    let html = field("Hambatan R1 (Ohm)", "r1") +
               field("Hambatan R2 (Ohm)", "r2");

    if (type === "3") {
        html += field("Hambatan R3 (Ohm)", "r3");
    }

    $("circuitInputs").innerHTML = html;
}

function calculateCircuit() {
    const type = $("circuitType").value;
    const r1 = getValue("r1");
    const r2 = getValue("r2");

    if (!validNonNegative(r1, r2) || r1 <= 0 || r2 <= 0) {
        return showError("Semua hambatan harus lebih besar dari nol.");
    }

    let result, lines = [];

    if (type === "1") {
        result = r1 + r2;

        lines.push("Rumus seri: Rt = R1 + R2");
        lines.push(`Rt = ${r1} + ${r2}`);
    }

    else {
        let paralel;

        if (type === "2") {
            paralel = 1 / (1 / r1 + 1 / r2);
            result = paralel;

            lines.push("Rumus paralel: 1/Rt = 1/R1 + 1/R2");
            lines.push(`Rt = ${format(paralel)} Ohm`);
        }

        else {
            const r3 = getValue("r3");

            if (!validNonNegative(r3) || r3 <= 0) {
                return showError("Hambatan R3 harus lebih besar dari nol.");
            }

            paralel = 1 / (1 / r2 + 1 / r3);
            result = r1 + paralel;

            lines.push("Rumus paralel: Rp = (R2 × R3) / (R2 + R3)");
            lines.push(`Rp = ${format(paralel)} Ohm`);
            lines.push("R1 diseri dengan hasil paralel R2 dan R3.");
        }
    }

    lines.push(`Hambatan total = ${format(result)} Ohm`);

    showResult("Hasil Kalkulator Rangkaian", lines);
}

// ===================================
// 4. KALKULATOR 3 FASA
// ===================================

function phaseFields() {
    const mode = $("phaseMode").value;

    let html = field("Tegangan antar-fasa (V)", "phaseV") +
               field("Power Factor (0-1)", "phasePF");

    if (mode === "1") {
        html += field("Arus (A)", "phaseI");
    } else {
        html += field("Daya aktif (W)", "phaseP");
    }

    $("phaseInputs").innerHTML = html;
}

function calculatePhase() {
    const mode = $("phaseMode").value;
    const v = getValue("phaseV");
    const pf = getValue("phasePF");

    if (!validNonNegative(v, pf) || v <= 0 || pf <= 0 || pf > 1) {
        return showError("Tegangan harus positif dan PF harus berada pada rentang lebih dari 0 sampai 1.");
    }

    let arus, dayaAktif;

    if (mode === "1") {
        arus = getValue("phaseI");

        if (!validNonNegative(arus)) {
            return showError("Arus tidak valid.");
        }

        dayaAktif = Math.sqrt(3) * v * arus * pf;
    } else {
        dayaAktif = getValue("phaseP");

        if (!validNonNegative(dayaAktif)) {
            return showError("Daya aktif tidak valid.");
        }

        arus = dayaAktif / (Math.sqrt(3) * v * pf);
    }

    const dayaSemu = Math.sqrt(3) * v * arus;
    const dayaReaktif = dayaSemu * Math.sqrt(1 - pf ** 2);

    showResult("Hasil Kalkulator 3 Fasa", [
        `Arus = ${format(arus)} A`,
        `Daya aktif = ${format(dayaAktif)} W`,
        `Daya semu = ${format(dayaSemu)} VA`,
        `Daya reaktif = ${format(dayaReaktif)} VAR`
    ]);
}

// ===================================
// 5. SMART FORMULA
// ===================================

function calculateSmart() {
    const target = $("smartTarget").value;

    const v = getValue("smartV");
    const i = getValue("smartI");
    const r = getValue("smartR");
    const p = getValue("smartP");

    if (!validNonNegative(v, i, r, p)) {
        return showError("Nilai input tidak boleh negatif.");
    }

    let result, name, unit, formula;

    if (target === "1") {
        name = "Tegangan";
        unit = "V";

        if (i > 0 && r > 0) {
            result = i * r;
            formula = "V = I × R";
        } else if (p > 0 && i > 0) {
            result = p / i;
            formula = "V = P / I";
        } else if (p > 0 && r > 0) {
            result = Math.sqrt(p * r);
            formula = "V = √(P × R)";
        }
    }

    else if (target === "2") {
        name = "Arus";
        unit = "A";

        if (v > 0 && r > 0) {
            result = v / r;
            formula = "I = V / R";
        } else if (p > 0 && v > 0) {
            result = p / v;
            formula = "I = P / V";
        } else if (p > 0 && r > 0) {
            result = Math.sqrt(p / r);
            formula = "I = √(P / R)";
        }
    }

    else if (target === "3") {
        name = "Hambatan";
        unit = "Ohm";

        if (v > 0 && i > 0) {
            result = v / i;
            formula = "R = V / I";
        } else if (v > 0 && p > 0) {
            result = v ** 2 / p;
            formula = "R = V² / P";
        } else if (p > 0 && i > 0) {
            result = p / i ** 2;
            formula = "R = P / I²";
        }
    }

    else {
        name = "Daya";
        unit = "W";

        if (v > 0 && i > 0) {
            result = v * i;
            formula = "P = V × I";
        } else if (v > 0 && r > 0) {
            result = v ** 2 / r;
            formula = "P = V² / R";
        } else if (i > 0 && r > 0) {
            result = i ** 2 * r;
            formula = "P = I² × R";
        }
    }

    if (!Number.isFinite(result) || result <= 0) {
        return showError("Data belum mencukupi untuk menentukan variabel.");
    }

    showResult("Hasil Smart Formula", [
        `Rumus yang digunakan: ${formula}`,
        `${name} = ${format(result)} ${unit}`
    ]);
}

// ===================================
// 6. STEP-BY-STEP
// ===================================

function stepsHTML() {
    if (langkahTerakhir.length === 0) {
        return "Belum ada perhitungan. Lakukan perhitungan terlebih dahulu.";
    }

    return langkahTerakhir.map((step, index) =>
        `<p class="step">${index + 1}. ${step}</p>`
    ).join("");
}

// ===================================
// 7. UNIT CONVERTER
// ===================================

function convertUnit() {
    const type = Number($("convertType").value);
    const value = getValue("convertValue");

    if (!Number.isFinite(value)) {
        return showError("Masukkan angka yang valid.");
    }

    const conversions = {
        1: [value / 1000, "kV"],
        2: [value * 1000, "V"],
        3: [value * 1000, "mA"],
        4: [value / 1000, "A"],
        5: [value / 1000, "kW"],
        6: [value * 1000, "W"],
        7: [value / 1000, "kOhm"],
        8: [value * 1000, "Ohm"]
    };

    const [result, unit] = conversions[type];

    showResult("Hasil Unit Converter", [
        `Nilai awal: ${format(value)}`,
        `Hasil konversi: ${format(result)} ${unit}`
    ]);
}
