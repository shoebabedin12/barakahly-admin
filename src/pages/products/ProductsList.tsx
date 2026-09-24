import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ApiError } from "../../lib/api";
import { assetUrl } from "../../lib/assetUrl";
import { listBrands } from "../../lib/brands";
import { listTopLevelCategories } from "../../lib/categories";
import { bulkProductAction, deleteProduct, listProducts } from "../../lib/products";
import type { Brand, Category, Product } from "../../lib/types";

export function ProductsList() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listTopLevelCategories().then(setCategories);
    listBrands(1).then((res) => setBrands(res.data));
  }, []);

  function load() {
    setError(null);
    listProducts({
      page,
      search: search || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      brandId: brandId ? Number(brandId) : undefined,
      status: status === "" ? undefined : status === "true",
    })
      .then((res) => {
        setProducts(res.data);
        setLastPage(res.meta.lastPage);
        setSelected(new Set());
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load products."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId, brandId, status]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulkAction(action: "delete" | "active" | "inactive") {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await bulkProductAction(Array.from(selected), action);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Bulk action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await deleteProduct(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete product.");
      setPendingDelete(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <Link to="/products/new" className="btn-secondary">
          + New Product
        </Link>
      </div>

      <form className="toolbar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        {selected.size > 0 && (
          <div className="bulk-bar">
            <span>{selected.size} selected</span>
            <button className="btn-secondary" disabled={busy} onClick={() => runBulkAction("active")}>
              Set Active
            </button>
            <button className="btn-secondary" disabled={busy} onClick={() => runBulkAction("inactive")}>
              Set Inactive
            </button>
            <button className="btn-danger" disabled={busy} onClick={() => runBulkAction("delete")}>
              Delete Selected
            </button>
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th></th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => {
              const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
              const effectiveStock = product.variants.length
                ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                : product.stock;

              return (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelected(product.id)}
                    />
                  </td>
                  <td>
                    {primaryImage ? (
                      <img className="product-thumb" src={assetUrl(primaryImage.image) ?? undefined} alt="" />
                    ) : (
                      <div className="product-thumb-placeholder" />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{product.sku}</td>
                  <td>{product.category?.name ?? "—"}</td>
                  <td>
                    {product.discountPrice ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "var(--color-muted)" }}>
                          {product.price}
                        </span>{" "}
                        {product.discountPrice}
                      </>
                    ) : (
                      product.price
                    )}
                  </td>
                  <td>{effectiveStock}</td>
                  <td>
                    <span className={`badge ${product.status ? "badge-active" : "badge-inactive"}`}>
                      {product.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/products/${product.id}/edit`} className="btn-secondary">
                        Edit
                      </Link>
                      <button className="btn-danger" onClick={() => setPendingDelete(product)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products?.length === 0 && <div className="empty-state">No products found.</div>}

        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span style={{ alignSelf: "center", fontSize: 13, color: "var(--color-muted)" }}>
            Page {page} of {lastPage}
          </span>
          <button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete product?"
          message={`This will permanently delete "${pendingDelete.name}" and its images/variants.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
