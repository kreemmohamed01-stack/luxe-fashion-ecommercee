const {
  PROMO_CODES,
  normalizeText,
  formatMoney,
  readCartState,
  writeCartState,
  clearCartState,
  calculateCartSummary,
  readCheckoutDraft,
  writeCheckoutDraft,
  clearCheckoutDraft,
  createOrderFromCheckout,
  writeLatestOrder
} = window.LuxeOrderUtils;

const escapeHtml = window.LuxeOrderUtils.escapeHtml;

const animateNumber = (node, targetValue, formatter = formatMoney) => {
  if (!node) {
    return;
  }

  const startValue = Number.parseFloat(node.dataset.value ?? "0");
  const endValue = Number.isFinite(targetValue) ? targetValue : 0;

  if (Math.abs(startValue - endValue) < 0.01) {
    node.textContent = formatter(endValue);
    node.dataset.value = String(endValue);
    return;
  }

  const duration = 420;
  const startTime = performance.now();

  const tick = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startValue + (endValue - startValue) * eased;
    node.textContent = formatter(current);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    node.textContent = formatter(endValue);
    node.dataset.value = String(endValue);
  };

  window.requestAnimationFrame(tick);
};

const renderItems = (container, items) => {
  if (!container) {
    return;
  }

  container.innerHTML = items
    .map((item) => `
      <article class="checkout-summary-item">
        <div class="checkout-summary-item__media">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        </div>
        <div class="checkout-summary-item__copy">
          <h3 class="checkout-summary-item__name">${escapeHtml(item.name)}</h3>
          <p class="checkout-summary-item__meta">${escapeHtml(item.collection)}</p>
          <p class="checkout-summary-item__detail">
            Size: ${escapeHtml(item.size)}<br>
            Color: ${escapeHtml(item.color)}<br>
            Qty: ${item.quantity}
          </p>
        </div>
        <div class="checkout-summary-item__price">${formatMoney(item.lineTotal)}</div>
      </article>
    `)
    .join("");
};

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-checkout-form]");
  const fieldInputs = Array.from(document.querySelectorAll("[data-checkout-input]"));
  const paymentInputs = Array.from(document.querySelectorAll("[data-checkout-payment]"));
  const cardFields = document.querySelector("[data-card-fields]");
  const cardNumberInput = document.querySelector("[data-card-number]");
  const expiryInput = document.querySelector("[data-card-expiry]");
  const cvvInput = document.querySelector("[data-card-cvv]");
  const summaryEmpty = document.querySelector("[data-summary-empty]");
  const summaryContent = document.querySelector("[data-summary-content]");
  const summaryItems = document.querySelector("[data-summary-items]");
  const promoInput = document.querySelector("[data-summary-promo-input]");
  const promoButton = document.querySelector("[data-summary-promo-apply]");
  const promoNote = document.querySelector("[data-summary-promo-note]");
  const submitButton = document.querySelector("[data-summary-submit]");
  const subtotalNode = document.querySelector("[data-summary-subtotal]");
  const shippingNode = document.querySelector("[data-summary-shipping]");
  const discountNode = document.querySelector("[data-summary-discount]");
  const taxNode = document.querySelector("[data-summary-tax]");
  const totalNode = document.querySelector("[data-summary-total]");
  const transitionNode = document.querySelector(".checkout-transition");

  const getSelectedPaymentMethod = () =>
    paymentInputs.find((input) => input.checked)?.value || "credit-card";

  const getCartState = () => readCartState() ?? { items: [], promoCode: "", promoMessage: "" };

  const setPromoNote = (message, isSuccess = false) => {
    if (!promoNote) {
      return;
    }

    promoNote.textContent = message;
    promoNote.classList.toggle("is-success", Boolean(isSuccess));
  };

  const setFieldValidity = (input, isValid) => {
    if (!(input instanceof HTMLElement)) {
      return;
    }

    input.classList.toggle("is-invalid", !isValid);
    input.setAttribute("aria-invalid", String(!isValid));
  };

  const readDraftFromForm = () => {
    const draft = readCheckoutDraft();

    fieldInputs.forEach((input) => {
      const key = input.getAttribute("data-checkout-input");
      if (!key) {
        return;
      }

      draft[key] = normalizeText(input.value);
    });

    draft.country = "Egypt";
    draft.city = "Cairo";
    draft.paymentMethod = getSelectedPaymentMethod();
    return draft;
  };

  const persistDraft = () => {
    writeCheckoutDraft(readDraftFromForm());
  };

  const populateDraft = () => {
    const draft = readCheckoutDraft();

    fieldInputs.forEach((input) => {
      const key = input.getAttribute("data-checkout-input");
      if (!key) {
        return;
      }

      if (key === "country") {
        input.value = "Egypt";
      } else if (key === "city") {
        input.value = "Cairo";
      } else if (draft[key]) {
        input.value = draft[key];
      }

      setFieldValidity(input, true);
    });

    paymentInputs.forEach((input) => {
      input.checked = input.value === draft.paymentMethod;
    });

    if (!paymentInputs.some((input) => input.checked) && paymentInputs[0]) {
      paymentInputs[0].checked = true;
    }
  };

  const validateField = (input) => {
    if (!(input instanceof HTMLInputElement)) {
      return true;
    }

    const key = input.getAttribute("data-checkout-input");
    const value = normalizeText(input.value);
    const paymentMethod = getSelectedPaymentMethod();

    if (!key) {
      return true;
    }

    if (["cardholder", "cardNumber", "expiry", "cvv"].includes(key) && paymentMethod !== "credit-card") {
      setFieldValidity(input, true);
      return true;
    }

    let isValid = true;

    switch (key) {
      case "email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case "phone":
        isValid = value.replace(/[^\d]/g, "").length >= 8;
        break;
      case "suite":
        isValid = true;
        break;
      case "postalCode":
        isValid = value.length >= 4;
        break;
      case "cardholder":
        isValid = value.length >= 4;
        break;
      case "cardNumber":
        isValid = value.replace(/\D/g, "").length === 16;
        break;
      case "expiry":
        isValid = /^(0[1-9]|1[0-2]) \/ \d{2}$/.test(value);
        break;
      case "cvv":
        isValid = /^\d{3}$/.test(value);
        break;
      default:
        isValid = Boolean(value);
        break;
    }

    setFieldValidity(input, isValid);
    return isValid;
  };

  const validateForm = () => {
    let isValid = true;
    let firstInvalid = null;

    fieldInputs.forEach((input) => {
      const valid = validateField(input);
      if (!valid && !firstInvalid) {
        firstInvalid = input;
      }
      isValid = isValid && valid;
    });

    if (firstInvalid instanceof HTMLElement) {
      firstInvalid.focus({ preventScroll: false });
    }

    return isValid;
  };

  const renderSummary = () => {
    const state = getCartState();
    const summary = calculateCartSummary(state);
    const hasItems = summary.items.length > 0;

    if (summaryEmpty) {
      summaryEmpty.hidden = hasItems;
    }

    if (summaryContent) {
      summaryContent.hidden = !hasItems;
    }

    if (!hasItems) {
      setPromoNote("");
      if (submitButton) {
        submitButton.disabled = true;
      }
      return;
    }

    renderItems(summaryItems, summary.items);

    if (promoInput) {
      promoInput.value = summary.promoCode;
    }

    if (summary.promoCode && summary.discount > 0) {
      setPromoNote(`${summary.promoCode} applied: -${formatMoney(summary.discount)}`, true);
    } else if (!promoInput?.matches(":focus")) {
      setPromoNote("");
    }

    if (submitButton) {
      submitButton.disabled = false;
    }

    animateNumber(subtotalNode, summary.subtotal);
    animateNumber(shippingNode, summary.shipping);
    animateNumber(discountNode, summary.discount, (value) => (value > 0 ? `-${formatMoney(value)}` : formatMoney(0)));
    animateNumber(taxNode, summary.tax);
    animateNumber(totalNode, summary.total);
  };

  const syncPaymentState = () => {
    const selectedValue = getSelectedPaymentMethod();
    const showCardFields = selectedValue === "credit-card";

    cardFields?.classList.toggle("is-hidden", !showCardFields);
    document.body.dataset.paymentMethod = selectedValue;
  };

  const startExitTransition = (onComplete) => {
    document.body.classList.add("is-submitting");
    transitionNode?.classList.add("is-active");
    window.setTimeout(() => {
      document.body.classList.add("is-exiting");
      onComplete();
    }, 520);
  };

  paymentInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncPaymentState();
      persistDraft();
    });
  });

  fieldInputs.forEach((input) => {
    input.addEventListener("input", () => {
      validateField(input);
      persistDraft();
    });
    input.addEventListener("blur", () => validateField(input));
  });

  cardNumberInput?.addEventListener("input", () => {
    const digits = cardNumberInput.value.replace(/\D/g, "").slice(0, 16);
    const groups = digits.match(/.{1,4}/g) || [];
    cardNumberInput.value = groups.join(" ");
  });

  expiryInput?.addEventListener("input", () => {
    const digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      expiryInput.value = digits;
      return;
    }
    expiryInput.value = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  });

  cvvInput?.addEventListener("input", () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 3);
  });

  promoButton?.addEventListener("click", () => {
    const state = getCartState();
    const code = normalizeText(promoInput?.value).toUpperCase();

    if (!code) {
      state.promoCode = "";
      state.promoMessage = "";
      writeCartState(state);
      setPromoNote("Promo code removed.");
      renderSummary();
      return;
    }

    if (!PROMO_CODES[code]) {
      setPromoNote("Promo code not recognized.");
      return;
    }

    state.promoCode = code;
    state.promoMessage = `${code} applied`;
    writeCartState(state);
    renderSummary();
  });

  promoInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      promoButton?.click();
    }
  });

  submitButton?.addEventListener("click", () => {
    const summary = calculateCartSummary(getCartState());

    if (!summary.items.length) {
      return;
    }

    if (!validateForm()) {
      setPromoNote("Please complete the highlighted checkout details.");
      return;
    }

    const draft = readDraftFromForm();
    const order = createOrderFromCheckout(draft, getCartState());
    const orderSaved = writeLatestOrder(order);

    if (!orderSaved) {
      setPromoNote("We could not secure your order details. Please try again.");
      return;
    }

    clearCartState();
    clearCheckoutDraft();

    if (submitButton) {
      submitButton.textContent = "Securing Order...";
      submitButton.disabled = true;
    }

    startExitTransition(() => {
      window.location.href = "order-confirmation.html";
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === window.LuxeOrderUtils.CART_STORAGE_KEY || window.LuxeOrderUtils.LEGACY_CART_KEYS.includes(event.key)) {
      renderSummary();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      renderSummary();
    }
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitButton?.click();
  });

  populateDraft();
  syncPaymentState();
  renderSummary();

  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });

  window.requestAnimationFrame(() => {
    persistDraft();
  });
});
