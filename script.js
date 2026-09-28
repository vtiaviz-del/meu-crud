const API_URL = "SUA_URL_DO_APPS_SCRIPT_AQUI";

// Referências aos elementos do DOM
const productForm = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");
const productTableBody = document.getElementById("productTableBody");
const loadingDiv = document.getElementById("loading");
const formTitle = document.getElementById("formTitle");
const btnCancel = document.getElementById("btnCancel");

document.addEventListener("DOMContentLoaded", loadProducts);

// 1. BUSCAR E EXIBIR DADOS (GET)
async function loadProducts() {
  showLoading(true);
  try {
    // redirect: "follow" é necessário por conta do redirecionamento 302 do Apps Script
    const response = await fetch(`${API_URL}?action=readAll`, {
      method: "GET",
      redirect: "follow"
    });
    const result = await response.json();

    if (result.status === "success") {
      renderTable(result.data);
    } else {
      alert("Erro ao carregar dados: " + result.message);
    }
  } catch (error) {
    console.error("Erro GET:", error);
    alert("Falha ao conectar à API.");
  } finally {
    showLoading(false);
  }
}

// Injeta as linhas da tabela no HTML
function renderTable(products) {
  productTableBody.innerHTML = "";
  if (products.length === 0) {
    productTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>R$ ${Number(p.preco).toFixed(2)}</td>
      <td>${p.quantidade}</td>
      <td>
        <button class="btn-edit" onclick="editProduct(${p.id}, '${p.nome}', ${p.preco}, ${p.quantidade})">Editar</button>
        <button class="btn-delete" onclick="deleteProduct(${p.id})">Excluir</button>
      </td>
    `;
    productTableBody.appendChild(tr);
  });
}

// 2. SALVAR OU ATUALIZAR REGISTRO (POST)
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = productIdInput.value;
  const action = id ? "update" : "create";

  const payload = {
    action: action,
    id: id ? Number(id) : undefined,
    nome: nomeInput.value,
    preco: parseFloat(precoInput.value),
    quantidade: parseInt(quantidadeInput.value)
  };

  showLoading(true);

  try {
    // Usa Content-Type: text/plain para evitar bloqueios de CORS Preflight no navegador
    const response = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === "success") {
      resetForm();
      await loadProducts();
    } else {
      alert("Erro ao salvar: " + result.message);
    }
  } catch (error) {
    console.error("Erro POST:", error);
    alert("Erro ao enviar dados.");
  } finally {
    showLoading(false);
  }
});

// 3. EXCLUIR REGISTRO (POST)
async function deleteProduct(id) {
  if (!confirm(`Deseja excluir o produto de ID ${id}?`)) return;

  showLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", id: Number(id) })
    });

    const result = await response.json();

    if (result.status === "success") {
      await loadProducts();
    } else {
      alert("Erro ao excluir: " + result.message);
    }
  } catch (error) {
    console.error("Erro na exclusão:", error);
    alert("Falha ao comunicar com a API.");
  } finally {
    showLoading(false);
  }
}

// Utilitários da interface
function editProduct(id, nome, preco, quantidade) {
  productIdInput.value = id;
  nomeInput.value = nome;
  precoInput.value = preco;
  quantidadeInput.value = quantidade;

  formTitle.textContent = "Editar Produto";
  btnCancel.style.display = "inline-block";
}

function resetForm() {
  productIdInput.value = "";
  productForm.reset();
  formTitle.textContent = "Novo Produto";
  btnCancel.style.display = "none";
}

function showLoading(isLoading) {
  loadingDiv.style.display = isLoading ? "block" : "none";
}
