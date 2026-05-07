import { useEffect, useState } from "react";

import {
  getUserLists,
  addBookToList,
  removeBookFromList,
  createList,
} from "../../api/lists";

import { useToast } from "../../context/ToastContext";

import styles from "./ListDropdown.module.css";

function ListDropdown({ book }) {
  const { addToast } = useToast();

  const [showPicker, setShowPicker] =
    useState(false);

  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] =
    useState(false);

  const [newListName, setNewListName] =
    useState("");

  useEffect(() => {
    async function fetchLists() {
      try {
        setLoadingLists(true);

        const data = await getUserLists();

        setLists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLists(false);
      }
    }

    if (showPicker) {
      fetchLists();
    }
  }, [showPicker]);

  const isInAnyList = lists.some((list) =>
    list.books.some((b) => b.id === book.id)
  );

  async function handleAdd(listId) {
    try {
      await addBookToList(listId, book.id);

      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                books: [...list.books, book],
              }
            : list
        )
      );

      addToast("Book added to list", "success");
    } catch {
      addToast("Failed to add book", "error");
    }
  }

  async function handleRemove(listId) {
    try {
      await removeBookFromList(listId, book.id);

      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                books: list.books.filter(
                    (b) => b.id !== book.id
                  ),
              }
            : list
        )
      );

      addToast("Book removed from list", "success");
    } catch {
      addToast("Failed to remove book", "error");
    }
  }

  async function handleCreateList() {
    const trimmed = newListName.trim();

    if (!trimmed) return;

    try {
      const created = await createList(trimmed);

      setLists((prev) => [
        ...prev,
        {
          ...created,
          books: [],
        },
      ]);

      setNewListName("");

      addToast("List created", "success");
    } catch {
      addToast("Failed to create list", "error");
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`btn ${
          isInAnyList
            ? "btn-secondary"
            : "btn-primary"
        }`}
        onClick={() =>
          setShowPicker((p) => !p)
        }
      >
        {isInAnyList
          ? "✓ In List"
          : "+ Add to List"}
      </button>

      {showPicker && (
        <div className={styles.dropdown}>
          {loadingLists ? (
            <p className={styles.loading}>
              Loading...
            </p>
          ) : (
            <>
              <div className={styles.listContainer}>
                {lists.map((list) => {
                  const inList = list.books.some(
                    (b) => b.id === book.id
                  );

                  return (
                    <div
                      key={list.id}
                      className={styles.listRow}
                    >
                      <span className={styles.listName}>
                        {list.name}
                      </span>

                      {inList ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() =>
                            handleRemove(list.id)
                          }
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleAdd(list.id)
                          }
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles.createSection}>
                <input
                  className={styles.input}
                  value={newListName}
                  onChange={(e) =>
                    setNewListName(
                      e.target.value
                    )
                  }
                  placeholder="New list..."
                />

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCreateList}
                >
                  Create
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListDropdown;