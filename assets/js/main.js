/* =========================================================
   한국라이프연구소 — 공통 스크립트
   ========================================================= */

// ---------- 모바일 메뉴 토글 ----------
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }
})();

// ---------- 예약구매 폼 로직 ----------
(function () {
  const form = document.getElementById("preorderForm");
  if (!form) return;

  const won = (n) => n.toLocaleString("ko-KR") + "원";

  const sumName = document.getElementById("sumName");
  const sumQty = document.getElementById("sumQty");
  const sumRegular = document.getElementById("sumRegular");
  const sumDiscount = document.getElementById("sumDiscount");
  const sumTotal = document.getElementById("sumTotal");

  function selectedProduct() {
    return document.querySelector('input[name="product"]:checked');
  }

  function updateSummary() {
    const p = selectedProduct();
    const price = parseInt(p.dataset.price, 10);
    const qty = parseInt(p.dataset.qty, 10) || 1;
    const regular = parseInt(p.dataset.regular, 10) || price;
    const discount = regular - price;

    sumName.textContent = p.value;
    sumQty.textContent = "×" + qty;
    sumRegular.textContent = won(regular);
    sumDiscount.textContent = (discount > 0 ? "-" : "") + won(discount);
    sumTotal.textContent = won(price);
  }

  // 플랜 선택 시 카드 강조 + 요약 갱신
  document.querySelectorAll('input[name="product"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.querySelectorAll(".pick").forEach((el) => el.classList.remove("selected"));
      radio.closest(".pick").classList.add("selected");
      updateSummary();
    });
  });

  // 전화번호 자동 하이픈
  const phone = document.getElementById("phone");
  phone.addEventListener("input", () => {
    let v = phone.value.replace(/[^0-9]/g, "").slice(0, 11);
    if (v.length > 7) v = v.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d+)/, "$1-$2");
    phone.value = v;
  });

  // 토스트
  const toast = document.getElementById("toast");
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }

  // 제출
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phoneVal = phone.value.trim();
    const address = document.getElementById("address").value.trim();
    const agree = document.getElementById("agree").checked;

    if (!name) return showToast("이름을 입력해 주세요.");
    if (phoneVal.replace(/[^0-9]/g, "").length < 10)
      return showToast("연락처를 정확히 입력해 주세요.");
    if (!address) return showToast("배송지 주소를 입력해 주세요.");
    if (!agree) return showToast("개인정보 수집·이용에 동의해 주세요.");

    const order = {
      product: selectedProduct().value,
      qty: parseInt(selectedProduct().dataset.qty, 10),
      total: sumTotal.textContent,
      name,
      phone: phoneVal,
      address,
      memo: document.getElementById("memo").value.trim(),
    };

    // TODO: 실제 운영 시 이 부분을 서버 전송(fetch)으로 교체하세요.
    //   예) fetch("/api/preorder", { method:"POST", body: JSON.stringify(order) })
    console.log("예약 접수:", order);

    showToast("예약이 접수되었습니다 ✅ 곧 확인 문자를 보내드릴게요.");
    form.reset();
    document.querySelectorAll(".pick").forEach((el, i) =>
      el.classList.toggle("selected", i === 0)
    );
    document.querySelector('input[name="product"]').checked = true;
    updateSummary();
  });

  updateSummary(); // 초기화
})();
