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

  // 예약 데이터를 구글시트로 전송하는 Apps Script 웹앱 주소.
  // 배포 후 받은 https://script.google.com/macros/s/.../exec 주소로 교체하세요.
  const RESERVATION_ENDPOINT = "https://script.google.com/macros/s/AKfycbz-AjAa2BBBSH1sSWoMyCBxxszNMKj3i6pYqvi7xahpoIiZ3dQ76FHAtYn0KI9XtvYQ/exec";

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

    const submitBtn = form.querySelector('button[type="submit"]');

    function resetForm() {
      form.reset();
      document.querySelectorAll(".pick").forEach((el, i) =>
        el.classList.toggle("selected", i === 0)
      );
      document.querySelector('input[name="product"]').checked = true;
      updateSummary();
    }

    // 구글시트 미연결(주소 미설정) 시: 콘솔에만 기록하고 안내.
    if (!RESERVATION_ENDPOINT || RESERVATION_ENDPOINT.indexOf("script.google.com") === -1) {
      console.log("예약 접수(미전송, 엔드포인트 미설정):", order);
      showToast("예약이 접수되었습니다 ✅ 곧 확인 연락을 드릴게요.");
      resetForm();
      return;
    }

    // 구글시트로 전송 (no-cors: 응답 본문은 읽지 않고 전송만 함)
    submitBtn.disabled = true;
    submitBtn.textContent = "접수 중…";
    fetch(RESERVATION_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(order),
    })
      .then(() => {
        showToast("예약이 접수되었습니다 ✅ 곧 확인 연락을 드릴게요.");
        resetForm();
      })
      .catch(() => {
        showToast("전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "예약 신청하기";
      });
  });

  updateSummary(); // 초기화
})();
