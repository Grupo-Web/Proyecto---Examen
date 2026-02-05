const API_URL = "http://localhost:3000/api";

let salesChart = null;

/**
 * Cargar y dibujar el reporte de ventas
 */
async function loadCharts() {
  try {
    const res = await fetch(`${API_URL}/reports/sales`);
    const data = await res.json();

    const canvas = document.getElementById("salesChart");
    const ctx = canvas.getContext("2d");

    // Destruir gráfica previa si existe
    if (salesChart) {
      salesChart.destroy();
    }

    // Preparar datos
    const labels = data.sales.map(sale =>
      new Date(sale.date).toLocaleDateString()
    );

    const totals = data.sales.map(sale => sale.total);

    // Crear gráfica
    salesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total vendido ($)",
            data: totals
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  } catch (error) {
    console.error("Error cargando reporte:", error);
  }
}

/**
 * Simular una venta
 */
document.getElementById("btnSimulate").addEventListener("click", async () => {
  const productId = document.getElementById("productId").value;
  const quantity = document.getElementById("quantity").value;
  const msg = document.getElementById("msg");

  try {
    const res = await fetch(`${API_URL}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            productId: Number(productId),
            quantity: Number(quantity)
          }
        ]
      })
    });

    if (!res.ok) {
      const error = await res.json();
      msg.innerText = "❌ " + (error.error || "Error al simular venta");
      msg.style.color = "red";
      return;
    }

    msg.innerText = "✅ Venta simulada correctamente";
    msg.style.color = "green";

    // Recargar gráfica
    loadCharts();

  } catch (error) {
    console.error("Error al simular venta:", error);
    msg.innerText = "❌ Error de conexión con el servidor";
    msg.style.color = "red";
  }
});

/**
 * Filtro por fechas
 */
document.getElementById("btnFilter").addEventListener("click", async () => {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  let url = `${API_URL}/reports/sales`;

  if (from && to) {
    url += `?startDate=${from}&endDate=${to}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (salesChart) {
      salesChart.destroy();
    }

    const ctx = document.getElementById("salesChart").getContext("2d");

    salesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.sales.map(s =>
          new Date(s.date).toLocaleDateString()
        ),
        datasets: [
          {
            label: "Total vendido ($)",
            data: data.sales.map(s => s.total)
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  } catch (error) {
    console.error("Error filtrando ventas:", error);
  }
});

/**
 * Cargar dashboard al iniciar
 */
loadCharts();
