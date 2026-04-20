let razorpayScriptPromise;

export const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src=\"${RAZORPAY_CHECKOUT_SRC}\"]`);

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = ({
  key,
  orderId,
  amount,
  currency = "INR",
  name,
  description,
  image,
  prefill,
  notes,
  theme,
  modal,
  onSuccess,
  onFailure,
}) => {
  if (typeof window === "undefined" || !window.Razorpay) {
    throw new Error("Razorpay SDK is unavailable");
  }

  const instance = new window.Razorpay({
    key,
    order_id: orderId,
    amount,
    currency,
    name,
    description,
    image,
    prefill,
    notes,
    theme,
    modal,
    handler: (response) => {
      if (typeof onSuccess === "function") {
        onSuccess(response);
      }
    },
  });

  if (typeof onFailure === "function") {
    instance.on("payment.failed", onFailure);
  }

  instance.open();
  return instance;
};
