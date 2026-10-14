/**
 * @param {{ name: string, mobile: string, email: string, address: string, city: string, state: string, pin: string }} values
 * @returns {Record<string, string>}
 */
export function validateCheckout(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(values.mobile.replace(/\s/g, ""))) errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (values.address.trim().length < 8) errors.address = "Enter your complete shipping address.";
  if (values.city.trim().length < 2) errors.city = "Enter your city.";
  if (values.state.trim().length < 2) errors.state = "Enter your state.";
  if (!/^\d{6}$/.test(values.pin)) errors.pin = "Enter a valid 6-digit PIN code.";
  return errors;
}
