import { Button } from "@/components/ui/button";
import { BookOpen, Bookmark, BookmarkCheck, X, ExternalLink } from "lucide-react";

function BookDetailsMainBook({
    book,
    activeUser,
    actionLoading,
    handlePhysicalBookAction,
    handleEbookAction,
    handleReadBook
}) {
    const getPhysicalButtonState = () => {
        const isRequested = book.borrowers?.some(borrower =>
            borrower.user === activeUser._id && !borrower.borrowed
        );
        const isBorrowed = book.borrowers?.some(borrower =>
            borrower.user === activeUser._id && borrower.borrowed
        );

        if (isBorrowed) {
            return { text: "Borrowed", icon: BookOpen, disabled: true };
        }
        if (isRequested) {
            return { text: "Withdraw Request", icon: X, disabled: false };
        }
        return { text: "Borrow", icon: BookOpen, disabled: false };
    };

    const getEbookButtonState = () => {
        const isSaved = book.savedBy?.includes(activeUser._id);

        if (isSaved) {
            return { text: "Unsave", icon: BookmarkCheck, disabled: false };
        }
        return { text: "Save", icon: Bookmark, disabled: false };
    };

    const physicalButtonState = getPhysicalButtonState();
    const ebookButtonState = getEbookButtonState();

    return (
        <>
            <section className="flex flex-col lg:flex-row gap-8 mb-12">
                {/* Book Image - Left Side */}
                <div className="w-full lg:w-1/3">
                    <div className="relative w-full max-w-xs mx-auto lg:max-w-none">
                        <img
                            src={book?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                            alt={book?.title || "Book Image"}
                            className="w-full h-64 sm:h-80 lg:h-96 rounded-lg object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                </div>

                {/* Book Details - Right Side */}
                <div className="w-full lg:w-2/3 space-y-4">
                    <div className="space-y-2">
                        <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                            {book?.genre || book?.category || "General"}
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                            {book?.title || "Book Title"}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300">
                            By <span className="text-[#d1a954] font-medium">{book?.author || "Unknown Author"}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <span>Genre: <span className="text-[#d1a954]">{book?.genre || "General"}</span></span>
                    </div>

                    {/* Only show availability stats for physical books */}
                    {(book?.bookType === "physical" || book?.bookType === "both" || !book?.bookType) && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{book?.available || 0}</div>
                                <div className="text-sm text-gray-400">Available</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">{(book?.count || 0) - (book?.available || 0)}</div>
                                <div className="text-sm text-gray-400">Borrowed</div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="text-sm text-gray-400">Book Type:</div>
                        <div className="text-lg font-semibold capitalize">{book?.bookType || "Physical"}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        {(book?.bookType === "physical" || book?.bookType === "both" || !book?.bookType) && (
                            <Button
                                onClick={handlePhysicalBookAction}
                                disabled={physicalButtonState.disabled || actionLoading}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${physicalButtonState.disabled
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : physicalButtonState.text === "Withdraw Request"
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-[#f5c784] hover:bg-[#f1b65f] text-black"
                                    }`}
                            >
                                <physicalButtonState.icon className="w-5 h-5" />
                                {actionLoading ? "Processing..." : physicalButtonState.text}
                            </Button>
                        )}

                        {(book?.bookType === "ebook" || book?.bookType === "both") && (
                            <>
                                <Button
                                    onClick={handleEbookAction}
                                    disabled={actionLoading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${ebookButtonState.text === "Unsave"
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-purple-600 hover:bg-purple-700 text-white"
                                        }`}
                                >
                                    <ebookButtonState.icon className="w-5 h-5" />
                                    {actionLoading ? "Processing..." : ebookButtonState.text}
                                </Button>

                                <Button
                                    onClick={handleReadBook}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Read Book
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Summary Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Summary</h2>
                <div className="bg-gray-800/30 p-6 rounded-lg">
                    <p className="text-gray-300 leading-relaxed">
                        {book?.summary || "No summary available for this book. Please check back later for more details about the content and storyline."}
                    </p>
                </div>
            </section>

            {/* Video Section - Only show if video exists */}
            {book?.videoCloudinary?.secure_url && (
                <section className="mb-12">
                    <h3 className="text-xl font-semibold mb-4">Preview Video</h3>
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                        <video
                            className="w-full h-full object-cover"
                            controls
                            poster="thumbnail.jpg"
                        >
                            <source src={book.videoCloudinary.secure_url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </section>
            )}
        </>
    );
}

export default BookDetailsMainBook;