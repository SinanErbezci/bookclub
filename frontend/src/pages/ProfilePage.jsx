import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchUserProfile } from "../api/users";
import { deleteList } from "../api/lists";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import CarouselSection from "../components/CarouselSection";
import BookCard from "../components/BookCard";

import Modal from "../components/Modal";

function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user, loading: authLoading } = useAuth();
    const { addToast } = useToast();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState(null);

    const isOwnProfile =
        user && (user.id === Number(id) || !id);

    // 🔥 Load profile
    useEffect(() => {
        if (!authLoading && !id && !user) {
            navigate("/login");
            return;
        }

        async function loadProfile() {
            try {
                const targetId = id || user?.id;
                if (!targetId) return;

                const res = await fetchUserProfile(targetId);
                setData(res);
            } catch {
                addToast("Failed to load profile", "error");
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            loadProfile();
        }
    }, [id, user, authLoading, navigate, addToast]);

    // 🔥 Delete list
    async function handleDeleteList(listId) {
        if (!window.confirm("Delete this list?")) return;

        try {
            await deleteList(listId);

            addToast("List deleted", "success");

            setData((prev) => ({
                ...prev,
                lists: prev.lists.filter((l) => l.id !== listId),
            }));
        } catch {
            addToast("Failed to delete list", "error");
        }
    }

    if (loading) return <p>Loading...</p>;
    if (!data) return <p>Profile not found</p>;

    return (
        <div className="profile-page">
            {/* HEADER */}
            <div className="profile-header">
                <h2>{data.user.username}</h2>
            </div>

            {/* LISTS */}
            <section className="profile-section">
                <h3>Lists</h3>

                {data.lists.length === 0 ? (
                    <p>No lists yet</p>
                ) : (
                    <div className="profile-list-grid">
                        {data.lists.map((list) => (
                            <div
                                key={list.id}
                                className="profile-card"
                                onClick={() => setSelectedList(list)}
                            >
                                <div className="profile-card-header">
                                    <h4>{list.name}</h4>

                                    {isOwnProfile && (
                                        <button
                                            className="btn secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteList(list.id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                <div className="profile-book-row">
                                    {list.books.slice(0, 5).map((book) => (
                                        <img
                                            key={book.id}
                                            src={book.cover}
                                            alt={book.title}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* REVIEWS */}
            <section className="profile-section">
                <h3>Reviews</h3>

                {data.reviews.length === 0 ? (
                    <p>No reviews yet</p>
                ) : (
                    data.reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <h4>{review.book.title}</h4>
                            <p>{review.content}</p>
                        </div>
                    ))
                )}
            </section>

            {/* MODAL */}
            <Modal
                isOpen={!!selectedList}
                onClose={() => setSelectedList(null)}
            >
                {console.log(selectedList)}
                {selectedList && (
                    <>
                        <CarouselSection
                            title={selectedList.name}
                            items={selectedList.books}
                            renderItem={(book) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    showAuthor
                                    action="Remove"
                                //onAction={(b) =>
                                //handleRemoveFromList(selectedList.id, b.id)
                                //}
                                />
                            )}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
}

export default ProfilePage;