export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        PROFILE: "/api/auth/profile",
        GET_PROFILE: "/api/auth/profile",
        UPDATE_PROFILE: "/api/auth/profile",
    },
    BOOKS: {
        CREATE_BOOK: "/api/books",
        GET_BOOKS: "/api/books",
        GET_BOOK_BY_ID: "/api/books",
        UPDATE_BOOK: "/api/books",
        DELETE_BOOK: "/api/books",
        UPDATE_COVER: "/api/books/cover",
        ADD_BOOKMARK: "/api/books/bookmarks",
        DELETE_BOOKMARK: "/api/books/bookmarks",
    },
    AI: {
        GENERATE_OUTLINE: "/api/ai/generate-outline",
        GENERATE_CHAPTER_CONTENT: "/api/ai/generate-chapter-content",
        DEFINE: "/api/ai/define",
        SPEAK: "/api/ai/speak",
        CONTINUE: "/api/ai/continue",
    },
    EXPORT: {
        PDF: "/api/export",
        DOC: "/api/export",
    },
}