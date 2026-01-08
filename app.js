const $ = (id) => document.getElementById(id);

$("genBtn").addEventListener("click", async () => {
  $("output").textContent = "Generating...";

  const payload = {
    productName: $("productName").value,
    brand: $("brand").value,
    category: $("category").value,
    audience: $("audience").value,
    tone: $("tone").value,
    keywords: $("keywords").value,
    features: $("features").value
  };

  const r = await fetch("http://localhost:5050/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await r.json();
  $("output").textContent = JSON.stringify(data, null, 2);
});
