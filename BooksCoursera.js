Initial Setup:
{
  "name": "bookstore-api",
  "version": "1.0.0",
  "main": "app.js",
  "dependencies": {
    "express": "^4.18.1",
    "axios": "^0.21.1",
    "body-parser": "^1.19.0"
  }
}

//File Structure:
- app.js
- routes/
    - books.js
    - users.js
- controllers/
    - booksController.js
    - usersController.js
- data/
    - books.json
    - users.json

//Basic Express Setup:
const express = require("express");
const bodyParser = require("body-parser");

const bookRoutes = require("./routes/books");
const userRoutes = require("./routes/users");

const app = express();
app.use(bodyParser.json());

app.use("/books", bookRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//Implement Book Routes:
const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");

// General user routes
router.get("/", booksController.getBookList);
router.get("/isbn/:isbn", booksController.getBookByISBN);
router.get("/author/:author", booksController.getBooksByAuthor);
router.get("/title/:title", booksController.getBooksByTitle);
router.get("/review/:isbn", booksController.getBookReview);

// Registered user routes
router.post("/review", booksController.addBookReview);
router.delete("/review/:isbn", booksController.deleteBookReview);

// Additional Methods
router.get("/async", booksController.getBooksAsync);
router.get("/search/isbn", booksController.searchByISBNPromise);
router.get("/search/author", booksController.searchByAuthor);
router.get("/search/title", booksController.searchByTitle);

module.exports = router;
//Book Controller:
exports.getBookList = async (req, res) => {
  try {
    // Assume books.json has an array of book objects
    const books = require("../data/books.json");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Error fetching book list" });
  }
};
//Get Book List (Task 1):
exports.getBookList = async (req, res) => {
  try {
    // Assume books.json has an array of book objects
    const books = require("../data/books.json");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Error fetching book list" });
  }
};
//Get Books by ISBN (Task2):
exports.getBookByISBN = async (req, res) => {
  const { isbn } = req.params;
  try {
    const books = require("../data/books.json");
    const book = books.find(book => book.isbn === isbn);
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching book by ISBN" });
  }
};
//Get All Books by Author (Task 3):
exports.getBooksByAuthor = async (req, res) => {
  const { author } = req.params;
  try {
    const books = require("../data/books.json");
    const authorBooks = books.filter(book => book.author.toLowerCase() === author.toLowerCase());
    res.status(200).json(authorBooks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching books by author" });
  }
};
//Get All Books by Title (Task 4):
exports.getBooksByTitle = async (req, res) => {
  const { title } = req.params;
  try {
    const books = require("../data/books.json");
    const titleBooks = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    res.status(200).json(titleBooks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching books by title" });
  }
};
//Get Book Review (Task 5):
exports.getBookReview = async (req, res) => {
  const { isbn } = req.params;
  try {
    const books = require("../data/books.json");
    const book = books.find(book => book.isbn === isbn);
    if (book && book.reviews) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ error: "No reviews found for this book" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching book review" });
  }
};
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/register", usersController.registerUser);
router.post("/login", usersController.loginUser);

module.exports = router;

//Register New User (Task 6):
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  // Logic to save new user, example to a users.json file
  res.status(201).json({ message: "User registered successfully" });
};
//Login as Registered User (Task 7):
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  // Logic to authenticate user, example from a users.json file
  res.status(200).json({ message: "User logged in successfully" });
};
//Add/Modify a Book Review(Task 8):
const fs = require("fs");
const path = require("path");

// Path to books JSON file
const booksFilePath = path.join(__dirname, "../data/books.json");

exports.addBookReview = async (req, res) => {
  const { isbn, userId, review, rating } = req.body;

  if (!isbn || !userId || !review || rating == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const books = JSON.parse(fs.readFileSync(booksFilePath));

    const book = books.find(b => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const existingReviewIndex = book.reviews?.findIndex(r => r.userId === userId);
    if (existingReviewIndex !== -1) {
      // Modify existing review
      book.reviews[existingReviewIndex] = { userId, review, rating };
    } else {
      // Add new review
      if (!book.reviews) book.reviews = [];
      book.reviews.push({ userId, review, rating });
    }

    // Save updated book data
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2));

    res.status(200).json({ message: "Review added/modified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding/modifying review" });
  }
};
//Delete a Book Review by the Registered User(Task 9):
exports.deleteBookReview = async (req, res) => {
  const { isbn } = req.params;
  const { userId } = req.body;

  if (!isbn || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const books = JSON.parse(fs.readFileSync(booksFilePath));

    const book = books.find(b => b.isbn === isbn);
    if (!book || !book.reviews) {
      return res.status(404).json({ error: "Book or reviews not found" });
    }

    const reviewIndex = book.reviews.findIndex(r => r.userId === userId);
    if (reviewIndex === -1) {
      return res.status(404).json({ error: "Review not found for this user" });
    }

    // Remove the review
    book.reviews.splice(reviewIndex, 1);

    // Save updated book data
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2));

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting review" });
  }
};
//Get All Books Using Async Callback Function(Task 10):
exports.getBooksAsync = (req, res) => {
  const books = require("../data/books.json");
  setTimeout(() => {
    res.status(200).json(books);
  }, 1000);
};
// Search by ISBN Using Promises (Task 11):
exports.searchByISBNPromise = (req, res) => {
  const { isbn } = req.query;
  const books = require("../data/books.json");
  new Promise((resolve, reject) => {
    const book = books.find(book => book.isbn === isbn);
    if (book) resolve(book);
    else reject("Book not found");
  })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};
//Search by Author( Task 12):
exports.searchByAuthor = async (req, res) => {
  const { author } = req.query;

  if (!author) {
    return res.status(400).json({ error: "Author query parameter is required" });
  }

  try {
    const books = require("../data/books.json");

    const matchedBooks = books.filter(book =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );

    if (matchedBooks.length > 0) {
      res.status(200).json(matchedBooks);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error searching by author" });
  }
};
// Search by Title (Task 13):
exports.searchByTitle = async (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: "Title query parameter is required" });
  }

  try {
    const books = require("../data/books.json");

    const matchedBooks = books.filter(book =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );

    if (matchedBooks.length > 0) {
      res.status(200).json(matchedBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error searching by title" });
  }
};


