import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getUserLists,
  addBookToList,
  removeBookFromList,
  createList,
} from "../../api/lists";

import { useToast } from "../../context/ToastContext";

import type { BookListItem } from "../../types/book";
import type { List } from "../../types/list";

import styles from "./ListDropdown.module.css";

interface ListDropdownProps {
  book: BookListItem;
}

function ListDropdown({
  book,
}: ListDropdownProps) {
  const { addToast } = useToast();

  const [showPicker, setShowPicker] =
    useState(false);

  const [lists, setLists] =
    useState<List[]>([]);

  const [loadingLists, setLoadingLists] =
    useState(false);

  const [newListName, setNewListName] =
    useState("");

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const [initialized, setInitialized] =
    useState(false);

  useEffect(() => {
    async function fetchLists() {
      try {
        setLoadingLists(true);

        const data = await getUserLists();

        setLists(data);
      } catch (err) {
        console.error(err);
        addToast(
          "Failed to load your lists",
          "error",
        );
      } finally {
        setLoadingLists(false);
        setInitialized(true);
      }
    }

    fetchLists();
  }, [book.id, addToast]);

  useEffect(() => {
    function handleClickOutside(
      e: MouseEvent,
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node,
        )
      ) {
        setShowPicker(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const isInAnyList = lists.some((list) =>
    list.books.some(
      (b) => b.id === book.id,
    ),
  );

  async function handleAdd(
    listId: number,
  ): Promise<void> {
    try {
      await addBookToList(
        listId,
        book.id,
      );

      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                books: [
                  ...list.books,
                  book,
                ],
              }
            : list,
        ),
      );

      addToast(
        "Book added to list",
        "success",
      );
    } catch {
      addToast(
        "Failed to add book",
        "error",
      );
    }
  }

  async function handleRemove(
    listId: number,
  ): Promise<void> {
    try {
      await removeBookFromList(
        listId,
        book.id,
      );

      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                books: list.books.filter(
                  (b) =>
                    b.id !== book.id,
                ),
              }
            : list,
        ),
      );

      addToast(
        "Book removed from list",
        "success",
      );
    } catch {
      addToast(
        "Failed to remove book",
        "error",
      );
    }
  }

  async function handleCreateList(): Promise<void> {
    const trimmed =
      newListName.trim();

    if (!trimmed) return;

    try {
      const created =
        await createList(trimmed);

      setLists((prev) => [
        ...prev,
        {
          ...created,
          books: [],
        },
      ]);

      setNewListName("");

      addToast(
        "List created",
        "success",
      );
    } catch {
      addToast(
        "Failed to create list",
        "error",
      );
    }
  }

  return (
    <div
      className={styles.wrapper}
      ref={dropdownRef}
    >
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
        {!initialized
          ? "Loading..."
          : isInAnyList
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
              <div
                className={
                  styles.listContainer
                }
              >
                {lists.map((list) => {
                  const inList =
                    list.books.some(
                      (b) =>
                        b.id === book.id,
                    );

                  return (
                    <div
                      key={list.id}
                      className={
                        styles.listRow
                      }
                    >
                      <span
                        className={
                          styles.listName
                        }
                      >
                        {list.name}
                      </span>

                      {inList ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() =>
                            handleRemove(
                              list.id,
                            )
                          }
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleAdd(
                              list.id,
                            )
                          }
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                className={
                  styles.createSection
                }
              >
                <input
                  className={styles.input}
                  value={newListName}
                  onChange={(e) =>
                    setNewListName(
                      e.target.value,
                    )
                  }
                  placeholder="New list..."
                />

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={
                    handleCreateList
                  }
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