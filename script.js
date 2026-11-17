
const $ = id => document.getElementById(id);

let langkahTerakhir = [];

// ===================================
// NAVIGASI
// ===================================

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

// ===================================
// MENU KALKULATOR
// ===================================

function openCalculator(type) {
    const tools = ["steps", "converter"];
    const area = $(tools.includes(type) ? "toolsArea" : "calculatorArea");

    const forms = {
        dc: `
            <h2>DC Circuit Calculator</h2>
            <p>Hitung resistansi total, arus, tegangan, daya, dan energi pada rangkaian DC.</p>

            <div class="calc-grid">
                <div class="field">
                    <label>Besaran yang ingin dihitung</label>
                    <select id="dcTarget" onchange="dcFields()">
                        <option value="rt">Resistansi Total (Rt)</option>
                        <option value="i">Arus Total (I)</option>
                        <option value="v">Tegangan Total (V)</option>
                        <option value="p">Daya Listrik (P)</option>
                        <option value="e">Energi Listrik (E)</option>
                    </select>
                </div>

                <div class="field">
                    <label>Konfigurasi rangkaian</label>
                    <select id="dcType" onchange="dcFields()">
                        <option value="1">Seri</option>
                        <option value="2">Paralel</option>
                        <option value="3">Campuran</option>
                    </select>
                </div>

                <div class="field">
                    <label>Jumlah resistor (2–8)</label>
                    <select id="dcCount" onchange="dcFields()">
                        <option value="2">2 Resistor</option>
                        <option value="3">3 Resistor</option>
                        <option value="4">4 Resistor</option>
                        <option value="5">5 Resistor</option>
                        <option value="6">6 Resistor</option>
                        <option value="7">7 Resistor</option>
                        <option value="8">8 Resistor</option>
                    </select>
                </div>
            </div>

            <div id="dcInputs" class="calc-grid"></div>

            <div class="calc-actions">
                <button class="primary-btn" onclick="calculateDC()">Hitung DC →</button>
                <button class="secondary-btn" onclick="openCalculator('dc')">Reset</button>
            </div>
        `,

        ac: `
            <h2>Kalkulator Listrik AC</h2>
            <p>Masukkan parameter arus bolak-balik.</p>

            <div class="calc-grid">
                ${field("Tegangan RMS (V)", "acV")}
                ${field("Arus RMS (A)", "acI")}
                ${field("Frekuensi (Hz)", "acF")}
                ${field("Power Factor (0–1)", "acPF")}
            </div>

            <div class="calc-actions">
                <button class="primary-btn" onclick="calculateAC()">Hitung AC →</button>
                <button class="secondary-btn" onclick="openCalculator('ac')">Reset</button>
            </div>
        `,

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
            </div>
        `,

        smart: `
            <h2>Smart Formula</h2>
            <p>Tentukan variabel yang ingin dicari. Isi 0 jika tidak diketahui.</p>

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
            </div>
        `,

        steps: `
            <h2>Step-by-Step</h2>
            <p>Menampilkan tahapan perhitungan terakhir yang telah dilakukan.</p>
            <div id="stepsResult" class="calc-result">
                ${stepsHTML()}
            </div>
        `,

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
                <input type="number" id="convertValue" step="any" placeholder="Masukkan nilai">
            </div>

            <div class="calc-actions">
                <button class="primary-btn" onclick="convertUnit()">Konversi →</button>
                <button class="secondary-btn" onclick="openCalculator('converter')">Reset</button>
            </div>
        `
    };

    if (!forms[type]) return;

    area.innerHTML = `
        <div class="calculator">
            ${forms[type]}
            ${type === "steps" ? "" : '<div id="result" class="calc-result" style="display:none"></div>'}
        </div>
    `;

    if (type === "dc") dcFields();
    if (type === "phase") phaseFields();
}

// ===================================
// FUNGSI DASAR
// ===================================

function field(label, id, placeholder = "Masukkan nilai") {
    return `
        <div class="field">
            <label>${label}</label>
            <input type="number" id="${id}" step="any" placeholder="${placeholder}">
        </div>
    `;
}

function getValue(id) {
    const element = $(id);
    if (!element) return NaN;

    const value = element.value.trim();
    return value === "" ? NaN : Number(value);
}

function format(value) {
    return Number(value).toLocaleString("id-ID", {
        maximumFractionDigits: 4
    });
}

function validNonNegative(...values) {
    return values.every(value =>
        Number.isFinite(value) && value >= 0
    );
}

// ===================================
// SISTEM STEP-BY-STEP
// ===================================

function mulaiLangkah() {
    langkahTerakhir = [];
}

function tambahLangkah(teks) {
    if (langkahTerakhir.length < 10) {
        langkahTerakhir.push(teks);
    }
}

function showResult(title, lines) {
    mulaiLangkah();

    tambahLangkah(title);
    lines.forEach(line => tambahLangkah(line));

    const resultArea = $("result");

    resultArea.style.display = "block";
    resultArea.innerHTML = `
        <h3>${title}</h3>
        ${lines.map(line => `<p class="step">${line}</p>`).join("")}
    `;
}

function showError(message) {
    const resultArea = $("result");

    resultArea.style.display = "block";
    resultArea.innerHTML = `
        <h3>Perhatian</h3>
        <p>${message}</p>
    `;
}

// ===================================
// 1. DC CIRCUIT CALCULATOR
// ===================================

function dcFields() {
    const target = $("dcTarget").value;
    const type = $("dcType").value;
    const countElement = $("dcCount");

    // Rangkaian campuran membutuhkan minimal 3 resistor.
    if (type === "3" && Number(countElement.value) < 3) {
        countElement.value = "3";
    }

    const count = Number(countElement.value);

    let html = "";

    html += `
        <div class="field">
            <label>Susunan rangkaian</label>
            <p class="step">
                ${type === "1"
                    ? "Semua resistor disusun secara seri."
                    : type === "2"
                        ? "Semua resistor disusun secara paralel."
                        : "R1 diseri dengan gabungan paralel R2 sampai resistor terakhir."}
            </p>
        </div>
    `;

    for (let n = 1; n <= count; n++) {
        html += field(`Hambatan R${n} (Ohm)`, `dcR${n}`);
    }

    if (target === "i" || target === "p" || target === "e") {
        html += field("Tegangan sumber (V)", "dcVoltage", "Masukkan tegangan");
    }

    if (target === "v") {
        html += field("Arus total (A)", "dcCurrent", "Masukkan arus");
    }

    if (target === "e") {
        html += field("Waktu (jam)", "dcTime", "Masukkan waktu");
    }

    $("dcInputs").innerHTML = html;
}

function calculateDC() {
    const target = $("dcTarget").value;
    const type = $("dcType").value;
    const count = Number($("dcCount").value);

    const resistors = [];

    for (let n = 1; n <= count; n++) {
        resistors.push(getValue(`dcR${n}`));
    }

    if (!validNonNegative(...resistors) ||
        resistors.some(value => value <= 0)) {
        return showError("Semua nilai resistor harus valid dan lebih besar dari nol.");
    }

    if (type === "3" && count < 3) {
        return showError("Rangkaian campuran membutuhkan minimal 3 resistor.");
    }

    let rt = 0;
    const lines = [];

    if (type === "1") {
        rt = resistors.reduce((total, value) => total + value, 0);

        lines.push("Jenis rangkaian: Seri");
        lines.push("Rumus: Rt = R1 + R2 + ... + Rn");
        lines.push(`Rt = ${resistors.map(format).join(" + ")}`);
    }

    else if (type === "2") {
        const reciprocalSum = resistors.reduce(
            (total, value) => total + (1 / value), 0
        );

        rt = 1 / reciprocalSum;

        lines.push("Jenis rangkaian: Paralel");
        lines.push("Rumus: 1/Rt = 1/R1 + 1/R2 + ... + 1/Rn");
        lines.push(`Jumlah kebalikan resistor = ${format(reciprocalSum)}`);
    }

    else {
        const parallelResistors = resistors.slice(1);

        const reciprocalSum = parallelResistors.reduce(
            (total, value) => total + (1 / value), 0
        );

        const parallelResult = 1 / reciprocalSum;
        rt = resistors[0] + parallelResult;

        lines.push("Jenis rangkaian: Campuran");
        lines.push("R1 diseri dengan gabungan paralel resistor lainnya.");
        lines.push(`Rp = ${format(parallelResult)} Ohm`);
        lines.push(`Rt = R1 + Rp = ${format(resistors[0])} + ${format(parallelResult)}`);
    }

    lines.push(`Resistansi total = ${format(rt)} Ohm`);

    let result;
    let name;
    let unit;

    if (target === "rt") {
        result = rt;
        name = "Resistansi Total";
        unit = "Ohm";
        lines.push(`Hasil akhir: Rt = ${format(result)} Ohm`);
    }

    else if (target === "i") {
        const voltage = getValue("dcVoltage");

        if (!validNonNegative(voltage)) {
            return showError("Tegangan sumber harus valid dan tidak negatif.");
        }

        result = voltage / rt;
        name = "Arus Total";
        unit = "A";

        lines.push(`I = V / Rt`);
        lines.push(`I = ${format(voltage)} / ${format(rt)}`);
        lines.push(`Hasil akhir: I = ${format(result)} A`);
    }

    else if (target === "v") {
        const current = getValue("dcCurrent");

        if (!validNonNegative(current)) {
            return showError("Arus total harus valid dan tidak negatif.");
        }

        result = current * rt;
        name = "Tegangan Total";
        unit = "V";

        lines.push("V = I × Rt");
        lines.push(`V = ${format(current)} × ${format(rt)}`);
        lines.push(`Hasil akhir: V = ${format(result)} V`);
    }

    else if (target === "p" || target === "e") {
        const voltage = getValue("dcVoltage");

        if (!validNonNegative(voltage)) {
            return showError("Tegangan sumber harus valid dan tidak negatif.");
        }

        const current = voltage / rt;
        const power = voltage * current;

        lines.push(`I = V / Rt = ${format(voltage)} / ${format(rt)} = ${format(current)} A`);
        lines.push(`P = V × I = ${format(voltage)} × ${format(current)} = ${format(power)} W`);

        if (target === "p") {
            result = power;
            name = "Daya Listrik";
            unit = "W";
            lines.push(`Hasil akhir: P = ${format(result)} W`);
        } else {
            const time = getValue("dcTime");

            if (!validNonNegative(time)) {
                return showError("Waktu harus valid dan tidak negatif.");
            }

            result = power * time;
            name = "Energi Listrik";
            unit = "Wh";

            lines.push(`E = P × t = ${format(power)} × ${format(time)}`);
            lines.push(`Hasil akhir: E = ${format(result)} Wh`);
        }
    }

    showResult(`Hasil ${name}`, [
        ...lines,
        `${name}: ${format(result)} ${unit}`
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

    if (!validNonNegative(v, i, f, pf) || f <= 0 || pf > 1) {
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
// 3. KALKULATOR 3 FASA
// ===================================

function phaseFields() {
    const mode = $("phaseMode").value;

    let html = field("Tegangan antar-fasa (V)", "phaseV");
    html += field("Power Factor (0–1)", "phasePF");

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
        return showError("Tegangan harus positif dan PF harus lebih dari 0 sampai 1.");
    }

    const sqrt3 = 1.73205080757;

    let arus;
    let dayaAktif;

    if (mode === "1") {
        arus = getValue("phaseI");

        if (!validNonNegative(arus)) {
            return showError("Arus tidak valid.");
        }

        dayaAktif = sqrt3 * v * arus * pf;
    } else {
        dayaAktif = getValue("phaseP");

        if (!validNonNegative(dayaAktif)) {
            return showError("Daya aktif tidak valid.");
        }

        arus = dayaAktif / (sqrt3 * v * pf);
    }

    const dayaSemu = sqrt3 * v * arus;
    const dayaReaktif = dayaSemu * Math.sqrt(1 - pf ** 2);

    showResult("Hasil Kalkulator 3 Fasa", [
        `Arus = ${format(arus)} A`,
        `Daya aktif = ${format(dayaAktif)} W`,
        `Daya semu = ${format(dayaSemu)} VA`,
        `Daya reaktif = ${format(dayaReaktif)} VAR`
    ]);
}

// ===================================
// 4. SMART FORMULA
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

    let result;
    let name;
    let unit;
    let formula;

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
// 5. STEP-BY-STEP
// ===================================

function stepsHTML() {
    if (langkahTerakhir.length === 0) {
        return "Belum ada langkah perhitungan. Lakukan perhitungan terlebih dahulu.";
    }

    const jumlahKarakter = langkahTerakhir[0].length;

    return `
        ${langkahTerakhir.map((step, index) =>
            `<p class="step">${index + 1}. ${step}</p>`
        ).join("")}

        <hr>
        <p class="step">
            Jumlah langkah: ${langkahTerakhir.length}
        </p>
        <p class="step">
            Jumlah karakter langkah pertama: ${jumlahKarakter}
        </p>
    `;
}

// ===================================
// 6. UNIT CONVERTER
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
