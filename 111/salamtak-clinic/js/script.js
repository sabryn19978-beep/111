/* ============================================================
   عيادة سلامتك الطبية — ملف JavaScript المشترك
   يحتوي على: قائمة الجوال، الترويسة، ظهور الأقسام،
   معرض الصور المكبّر، نموذج حجز المواعيد (واتساب)،
   زر العودة للأعلى، وتحديد الصفحة الحالية.
   يعمل بدون أي مكتبات خارجية وبدون قاعدة بيانات.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     1) قائمة التنقل على الجوال (لوحة جانبية)
     --------------------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.getElementById("primary-nav");
  var navBackdrop = document.querySelector(".nav-backdrop");
  var navClose = document.querySelector(".nav-close");

  function openNav() {
    if (!mainNav) return;
    mainNav.classList.add("is-open");
    if (navBackdrop) navBackdrop.classList.add("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    // نقل التركيز إلى زر الإغلاق لدعم لوحة المفاتيح
    if (navClose) navClose.focus();
  }

  function closeNav() {
    if (!mainNav) return;
    mainNav.classList.remove("is-open");
    if (navBackdrop) navBackdrop.classList.remove("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (navToggle) navToggle.focus();
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) { closeNav(); } else { openNav(); }
    });
  }
  if (navClose) navClose.addEventListener("click", closeNav);
  if (navBackdrop) navBackdrop.addEventListener("click", closeNav);

  // إغلاق اللوحة عند الضغط على Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mainNav && mainNav.classList.contains("is-open")) {
      closeNav();
    }
  });

  // إغلاق اللوحة عند العودة للعرض الكبير
  window.addEventListener("resize", function () {
    if (window.innerWidth > 920 && mainNav && mainNav.classList.contains("is-open")) {
      closeNav();
    }
  });

  /* ---------------------------------------------------------
     2) ظل الترويسة عند التمرير
     --------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------------------------------------------------
     3) زر العودة للأعلى
     --------------------------------------------------------- */
  var backToTop = document.querySelector(".back-to-top");
  function onScrollTop() {
    if (!backToTop) return;
    if (window.scrollY > 420) {
      backToTop.classList.add("is-visible");
    } else {
      backToTop.classList.remove("is-visible");
    }
  }
  window.addEventListener("scroll", onScrollTop, { passive: true });
  onScrollTop();
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // إرجاع التركيز إلى بداية الصفحة لقارئات الشاشة
      var skip = document.querySelector(".skip-link");
      if (skip) skip.focus();
    });
  }

  /* ---------------------------------------------------------
     4) تأثير ظهور الأقسام عند التمرير
     (مع دعم تفضيل تقليل الحركة)
     --------------------------------------------------------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // بدون دعم: نعرض الأقسام مباشرة
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     5) تحديد الصفحة الحالية في قائمة التنقل
     --------------------------------------------------------- */
  var navLinks = document.querySelectorAll(".main-nav a[href]");
  var currentFile = window.location.pathname.split("/").pop();
  if (currentFile === "" || currentFile === "\\") currentFile = "index.html";

  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    var file = href.split("#")[0];
    if (file === currentFile) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  /* ---------------------------------------------------------
     6) معرض الصور المكبّر (Lightbox)
     --------------------------------------------------------- */
  var galleryItems = Array.prototype.slice.call(
    document.querySelectorAll(".gallery-item")
  );

  if (galleryItems.length > 0) {
    // بناء واجهة العارض مرة واحدة
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "عارض الصور المكبّر");
    lightbox.innerHTML =
      '<button type="button" class="lb-btn lb-btn--close" aria-label="إغلاق العارض">&#10005;</button>' +
      '<button type="button" class="lb-btn lb-btn--prev" aria-label="الصورة السابقة">&#10095;</button>' +
      '<button type="button" class="lb-btn lb-btn--next" aria-label="الصورة التالية">&#10094;</button>' +
      '<figure class="lightbox__figure">' +
      '<img class="lightbox__img" src="" alt="">' +
      '<figcaption class="lightbox__caption"></figcaption>' +
      "</figure>" +
      '<span class="lb-counter" aria-live="polite"></span>';
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector(".lightbox__img");
    var lbCaption = lightbox.querySelector(".lightbox__caption");
    var lbCounter = lightbox.querySelector(".lb-counter");
    var btnClose = lightbox.querySelector(".lb-btn--close");
    var btnPrev = lightbox.querySelector(".lb-btn--prev");
    var btnNext = lightbox.querySelector(".lb-btn--next");
    var lbIndex = 0;
    var lastFocused = null;

    function renderLightbox() {
      var item = galleryItems[lbIndex];
      var img = item.querySelector("img");
      lbImg.src = item.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt || "";
      lbCaption.textContent = item.getAttribute("data-caption") || img.alt || "";
      lbCounter.textContent = "الصورة " + (lbIndex + 1) + " من " + galleryItems.length;
    }

    function openLightbox(i) {
      lbIndex = i;
      lastFocused = document.activeElement;
      renderLightbox();
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      btnClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    function nextItem() {
      lbIndex = (lbIndex + 1) % galleryItems.length;
      renderLightbox();
    }

    function prevItem() {
      lbIndex = (lbIndex - 1 + galleryItems.length) % galleryItems.length;
      renderLightbox();
    }

    galleryItems.forEach(function (item, i) {
      item.addEventListener("click", function () { openLightbox(i); });
    });

    btnClose.addEventListener("click", closeLightbox);
    btnNext.addEventListener("click", nextItem);
    btnPrev.addEventListener("click", prevItem);

    // النقر على الخلفية يغلق العارض
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // اختصارات لوحة المفاتيح
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      // اختصارات الأسهم (في RTL: يسار = التالي، يمين = السابق)
      if (e.key === "ArrowLeft") nextItem();
      if (e.key === "ArrowRight") prevItem();

      // حصر التركيز داخل العارض (Tab)
      if (e.key === "Tab") {
        var focusables = lightbox.querySelectorAll("button");
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------------------------------------------------------
     6.5) أزرار "احجز موعدًا" داخل صفحات أخرى:
     احفظ الخدمة والطبيب المختارين ليُملأ بهما النموذج تلقائيًا
     --------------------------------------------------------- */
  var bookLinks = document.querySelectorAll("[data-book-service]");
  bookLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      try {
        sessionStorage.setItem("salamtak-booking", JSON.stringify({
          service: link.getAttribute("data-book-service") || "",
          doctor: link.getAttribute("data-book-doctor") || ""
        }));
      } catch (err) { /* sessionStorage غير متاح */ }
    });
  });

  /* ---------------------------------------------------------
     7) نموذج طلب موعد ⇠ تحقق من المدخلات ثم تجهيز رسالة واتساب
     ملاحظة: لا يُعد الطلب حجزًا مؤكدًا حتى تتصل العيادة.
     --------------------------------------------------------- */
  var bookingForm = document.getElementById("booking-form");

  if (bookingForm) {
    // رقم واتساب العيادة (يُعدَّل من هنا أو من README)
    var CLINIC_WHATSAPP = "966571828519";

    // تعبئة الخدمة والطبيب من صفحة أخرى (إن وُجدا)
    try {
      var saved = sessionStorage.getItem("salamtak-booking");
      if (saved) {
        var parsed = JSON.parse(saved);
        var serviceSelect = document.getElementById("service");
        if (serviceSelect && parsed.service) {
          var wanted = parsed.service;
          var matched = Array.prototype.slice.call(serviceSelect.options).find(function (opt) {
            return opt.text.indexOf(wanted) !== -1 || wanted.indexOf(opt.text) !== -1;
          });
          if (matched) serviceSelect.value = matched.value;
        }
        var notesField = document.getElementById("notes");
        if (notesField && parsed.doctor && !notesField.value) {
          notesField.value = "أفضل الطبيب: " + parsed.doctor;
        }
        sessionStorage.removeItem("salamtak-booking");
      }
    } catch (err) { /* تجاهل */ }

    var resultBox = document.getElementById("form-result");
    var resultMsg = document.getElementById("form-result-msg");
    var waLink = document.getElementById("form-whatsapp-link");

    // رسائل الخطأ بالعربية
    var isEn = (document.documentElement.lang === "en");
    var messages = isEn ? {
      name: "Please enter a valid name (at least 2 characters).",
      phone: "Please enter a valid phone number (9 to 15 digits).",
      service: "Please select a specialty.",
      time: "Please select a preferred time.",
      consent: "You must agree to be contacted to confirm the appointment."
    } : {
      name: "يرجى إدخال اسم صحيح (على الأقل حرفين).",
      phone: "يرجى إدخال رقم هاتف صحيح (9 إلى 15 رقمًا).",
      service: "يرجى اختيار تخصص.",
      time: "يرجى اختيار وقت مفضل.",
      consent: "يجب الموافقة على التواصل لتأكيد الموعد."
    };

    function setError(field, message) {
      field.setAttribute("aria-invalid", "true");
      var errorEl = document.getElementById(field.id + "-error");
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(field) {
      field.removeAttribute("aria-invalid");
      var errorEl = document.getElementById(field.id + "-error");
      if (errorEl) errorEl.textContent = "";
    }

    // التحقق من حقل واحد وإرجاع صحة قيمته
    function validateField(field) {
      var value = (field.value || "").trim();

      if (field.id === "name") {
        if (value.length < 2 || !/^[\u0600-\u06FF\u0020A-Za-z\u0621-\u064A'.-]+$/.test(value)) {
          setError(field, messages.name);
          return false;
        }
      } else if (field.id === "phone") {
        var digits = value.replace(/[\s\-()]/g, "");
        if (!/^\+?\d{9,15}$/.test(digits)) {
          setError(field, messages.phone);
          return false;
        }
      } else if (field.id === "service") {
        if (!value) {
          setError(field, messages.service);
          return false;
        }
      } else if (field.id === "preferred-time") {
        if (!value) {
          setError(field, messages.time);
          return false;
        }
      } else if (field.id === "consent") {
        if (!field.checked) {
          setError(field, messages.consent);
          return false;
        }
      }

      clearError(field);
      return true;
    }

    // تحقق لحظي بعد مغادرة الحقل
    var fields = ["name", "phone", "service", "preferred-time", "consent"]
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    fields.forEach(function (field) {
      var eventName = (field.type === "checkbox" || field.tagName === "SELECT")
        ? "change" : "blur";
      field.addEventListener(eventName, function () { validateField(field); });
      // إزالة الخطأ عند الكتابة من جديد
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var allValid = true;
      var firstInvalid = null;
      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
        if (!ok) allValid = false;
      });

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // تجهيز بيانات الرسالة (لا نعرض أي بيانات مرضى)
      var name = document.getElementById("name").value.trim();
      var phone = document.getElementById("phone").value.trim();
      var serviceSelect = document.getElementById("service");
      var service = serviceSelect.options[serviceSelect.selectedIndex].text;
      var timeSelect = document.getElementById("preferred-time");
      var time = timeSelect.options[timeSelect.selectedIndex].text;
      var notes = (document.getElementById("notes").value || "").trim();

      var text =
        "طلب موعد جديد — عيادة سلامتك الطبية\n" +
        "---------------------------\n" +
        "الاسم: " + name + "\n" +
        "الجوال: " + phone + "\n" +
        "الخدمة: " + service + "\n" +
        "الوقت المفضل: " + time +
        (notes ? "\n" + "ملاحظات: " + notes : "") +
        "\n---------------------------\n" +
        "هذا طلب وليس حجزًا مؤكدًا، أرجو التواصل لتأكيد الموعد.";

      var encoded = encodeURIComponent(text);
      var url = "https://wa.me/" + CLINIC_WHATSAPP + "?text=" + encoded;

      // عرض النتيجة قبل فتح واتساب (توضيح ما يحدث بعد الإرسال)
      if (resultMsg) resultMsg.textContent = text;
      if (waLink) waLink.setAttribute("href", url);
      if (resultBox) {
        resultBox.classList.add("is-visible");
        resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
        resultBox.focus();
      }

      // فتح واتساب في نافذة جديدة
      window.open(url, "_blank", "noopener");
    });

    // زر إعادة التجربة داخل صندوق النتيجة
    var retryBtn = document.getElementById("form-retry");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        if (resultBox) resultBox.classList.remove("is-visible");
        var nameField = document.getElementById("name");
        if (nameField) nameField.focus();
      });
    }
  }

  /* ---------------------------------------------------------
     8) تحديث سنة الحقوق في التذييل
     --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
