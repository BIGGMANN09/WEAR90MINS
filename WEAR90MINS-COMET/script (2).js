document.getElementById("orderForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const form = event.target;
  const note = document.getElementById("formNote");
  const requiredFields = ["name", "phone", "jersey", "quantity", "details"];
  let valid = true;

  requiredFields.forEach(function(fieldName) {
    const field = form.elements[fieldName];
    if (!field.value.trim()) {
      field.style.borderColor = "#d1543f";
      valid = false;
    } else {
      field.style.borderColor = "";
    }
  });

  if (!valid) {
    note.textContent = "Please complete every field before submitting.";
    note.classList.remove("success");
    return;
  }

  note.textContent = "Order received. We will contact you with your mock-up and payment details.";
  note.classList.add("success");
  form.reset();
});