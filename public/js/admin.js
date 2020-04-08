function deleteProduct(button) {
  const prodId = button.parentNode.querySelector("[name=productId]").value;
  const csrf = button.parentNode.querySelector("[name=_csrf]").value;
  const productElement = document.getElementById(prodId);
  fetch("/admin/delete-product/" + prodId, {
    method: "DELETE",
    headers: { "csrf-token": csrf },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      productElement.remove();
    })
    .catch((err) => {
      console.log(err);
    });
}
