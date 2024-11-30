const express = require("express");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path"); // For handling file paths
const Route = express.Router();

// Multer storage configuration with file renaming
// Initialize multer with storage

// Middleware to check or create the `admin` table and its status
// Middleware to check or create the `admin` and `skills` tables
Route.get("/check-admin", (req, res) => {
    const createAdminTableQuery = `
        CREATE TABLE IF NOT EXISTS admin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            number VARCHAR(15) NOT NULL,
            cnic VARCHAR(15) NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `;

    const createSkillsTableQuery = `
        CREATE TABLE IF NOT EXISTS skills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            skill VARCHAR(255) NOT NULL,
            percentage INT NOT NULL
        )
    `;

    const createEducationTableQuery = `
        CREATE TABLE IF NOT EXISTS education (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL
        )
    `;

    const createProjectManagerTableQuery = `
        CREATE TABLE IF NOT EXISTS project_manager (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image_path VARCHAR(255) NOT NULL,
            link VARCHAR(255) NOT NULL
        )
    `;

    const createContactTableQuery = `
        CREATE TABLE IF NOT EXISTS contact (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create `admin` table
    db.query(createAdminTableQuery, (err) => {
        if (err) {
            console.error("Error creating admin table:", err);
            return res.status(500).send({ message: "Error checking or creating admin table", error: err });
        }

        // Create `skills` table after `admin` table
        db.query(createSkillsTableQuery, (err) => {
            if (err) {
                console.error("Error creating skills table:", err);
                return res.status(500).send({ message: "Error checking or creating skills table", error: err });
            }

            // Create `education` table after `skills` table
            db.query(createEducationTableQuery, (err) => {
                if (err) {
                    console.error("Error creating education table:", err);
                    return res.status(500).send({ message: "Error checking or creating education table", error: err });
                }

                // Create `project_manager` table after `education` table
                db.query(createProjectManagerTableQuery, (err) => {
                    if (err) {
                        console.error("Error creating project manager table:", err);
                        return res.status(500).send({ message: "Error checking or creating project manager table", error: err });
                    }

                    // Create `contact` table after `project_manager` table
                    db.query(createContactTableQuery, (err) => {
                        if (err) {
                            console.error("Error creating contact table:", err);
                            return res.status(500).send({ message: "Error checking or creating contact table", error: err });
                        }

                        // Check if there are rows in the `admin` table
                        const checkRowsQuery = "SELECT COUNT(*) AS count FROM admin";
                        db.query(checkRowsQuery, (err, results) => {
                            if (err) {
                                console.error("Error checking admin table rows:", err);
                                return res.status(500).send({ message: "Error checking admin rows", error: err });
                            }

                            const rowCount = results[0].count;
                            if (rowCount === 0) {
                                res.send({ redirect: "/register" }); // No rows, redirect to register
                            } else {
                                res.send({ redirect: "/" }); // At least one row, redirect to login
                            }
                        });
                    });
                });
            });
        });
    });
});





// create
Route.post("/admin/add", async (req, res) => {
    const { name, email, number, cnic, password } = req.body;

    // Input validation
    if (!name || !email || !number || !cnic || !password) {
        return res.status(400).send({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send({ message: "Invalid email format" });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO admin (name, email, number, cnic, password)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(query, [name, email, number, cnic, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).send({ message: "Email already exists" });
                }
                console.error("Error inserting admin:", err);
                return res.status(500).send({ message: "Error adding admin", error: err });
            }
            res.status(201).send({ message: "Admin added successfully", adminId: result.insertId });
        });
    } catch (err) {
        console.error("Error hashing password:", err);
        res.status(500).send({ message: "Error processing request", error: err });
    }
});

// Edit anad Updater
Route.put("/admin/edit/:id", async (req, res) => {
    const { name, email, number, cnic, password } = req.body;

    if (!name || !email || !number || !cnic) {
        return res.status(400).send({ message: "Name, email, number, and CNIC are required" });
    }

    let hashedPassword = null;
    if (password) {
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send({ message: "Error processing request", error: err });
        }
    }

    const updateQuery = `
        UPDATE admin
        SET name = ?, email = ?, number = ?, cnic = ? ${password ? ", password = ?" : ""}
        WHERE id = ?
    `;

    const queryValues = password
        ? [name, email, number, cnic, hashedPassword, req.params.id]
        : [name, email, number, cnic, req.params.id];

    db.query(updateQuery, queryValues, (err, result) => {
        if (err) {
            console.error("Error updating admin:", err);
            return res.status(500).send({ message: "Error updating admin", error: err });
        }
        res.send({ message: "Admin updated successfully", affectedRows: result.affectedRows });
    });
});

// Delete
Route.delete("/admin/delete/:id", (req, res) => {
    const deleteQuery = "DELETE FROM admin WHERE id = ?";
    db.query(deleteQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error deleting admin:", err);
            return res.status(500).send({ message: "Error deleting admin", error: err });
        }
        res.send({ message: "Admin deleted successfully", affectedRows: result.affectedRows });
    });
});

// Select *
Route.get("/admin", (req, res) => {
    const selectQuery = "SELECT id, name, email, number, cnic FROM admin";
    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error("Error retrieving admins:", err);
            return res.status(500).send({ message: "Error retrieving admins", error: err });
        }
        res.send(results);
    });
});

// Retrieve a single admin by Id
Route.get("/admin/:id", (req, res) => {
    const selectQuery = "SELECT id, name, email, number, cnic FROM admin WHERE id = ?";
    db.query(selectQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error retrieving admin:", err);
            return res.status(500).send({ message: "Error retrieving admin", error: err });
        }
        res.send(result[0]);
    });
});

// Login 
Route.post("/admin/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required" });
    }

    const query = "SELECT * FROM admin WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error("Error querying admin:", err);
            return res.status(500).send({ message: "Error querying admin", error: err });
        }

        if (results.length === 0) {
            return res.status(404).send({ message: "Admin not found" });
        }

        const admin = results[0];

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin.id, name: admin.name, email: admin.email },
            'your_jwt_secret_key', // Use a strong secret key
            { expiresIn: '1h' } // Expiry time (1 hour, can be adjusted)
        );

        res.status(200).send({
            message: "Login successful",
            token: token, // Send the token back to the client
            admin: { id: admin.id, name: admin.name, email: admin.email }
        });
    });
});
// token verified checker
Route.post("/verify-token", (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).send({ valid: false, message: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, "your_jwt_secret_key"); // Use your secret key
        return res.status(200).send({ valid: true, user: decoded });
    } catch (err) {
        return res.status(401).send({ valid: false, message: "Invalid or expired token" });
    }
});

// crud for skills 


// Add a new skill
Route.post("/skills/add", (req, res) => {
    const { skill, percentage } = req.body;

    if (!skill || !percentage) {
        return res.status(400).send({ message: "Skill and percentage are required" });
    }

    const insertQuery = "INSERT INTO skills (skill, percentage) VALUES (?, ?)";
    db.query(insertQuery, [skill, percentage], (err, result) => {
        if (err) {
            console.error("Error adding skill:", err);
            return res.status(500).send({ message: "Error adding skill", error: err });
        }
        res.status(201).send({ message: "Skill added successfully", skillId: result.insertId });
    });
});

// Retrieve all skills
Route.get("/skills", (req, res) => {
    const selectQuery = "SELECT * FROM skills";
    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error("Error retrieving skills:", err);
            return res.status(500).send({ message: "Error retrieving skills", error: err });
        }
        res.send(results);
    });
});

// Retrieve a single skill by ID
Route.get("/skills/:id", (req, res) => {
    const selectQuery = "SELECT * FROM skills WHERE id = ?";
    db.query(selectQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error retrieving skill:", err);
            return res.status(500).send({ message: "Error retrieving skill", error: err });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: "Skill not found" });
        }
        res.send(result[0]);
    });
});

// Update a skill
Route.put("/skills/edit/:id", (req, res) => {
    const { skill, percentage } = req.body;

    if (!skill || !percentage) {
        return res.status(400).send({ message: "Skill and percentage are required" });
    }

    const updateQuery = "UPDATE skills SET skill = ?, percentage = ? WHERE id = ?";
    db.query(updateQuery, [skill, percentage, req.params.id], (err, result) => {
        if (err) {
            console.error("Error updating skill:", err);
            return res.status(500).send({ message: "Error updating skill", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Skill not found" });
        }
        res.send({ message: "Skill updated successfully", affectedRows: result.affectedRows });
    });
});

// Delete a skill
Route.delete("/skills/delete/:id", (req, res) => {
    const deleteQuery = "DELETE FROM skills WHERE id = ?";
    db.query(deleteQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error deleting skill:", err);
            return res.status(500).send({ message: "Error deleting skill", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Skill not found" });
        }
        res.send({ message: "Skill deleted successfully", affectedRows: result.affectedRows });
    });
});






//education crud
// Retrieve all education entries
Route.get("/education", (req, res) => {
    const selectQuery = "SELECT * FROM education";
    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error("Error retrieving education entries:", err);
            return res.status(500).send({ message: "Error retrieving education entries", error: err });
        }
        res.send(results);
    });
});

// Retrieve a single education entry by ID
Route.get("/education/:id", (req, res) => {
    const selectQuery = "SELECT * FROM education WHERE id = ?";
    db.query(selectQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error retrieving education entry:", err);
            return res.status(500).send({ message: "Error retrieving education entry", error: err });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: "Education entry not found" });
        }
        res.send(result[0]);
    });
});

// Update an education entry
Route.put("/education/edit/:id", (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).send({ message: "Name and description are required" });
    }

    const updateQuery = "UPDATE education SET name = ?, description = ? WHERE id = ?";
    db.query(updateQuery, [name, description, req.params.id], (err, result) => {
        if (err) {
            console.error("Error updating education entry:", err);
            return res.status(500).send({ message: "Error updating education entry", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Education entry not found" });
        }
        res.send({ message: "Education entry updated successfully", affectedRows: result.affectedRows });
    });
});

// Delete an education entry
Route.delete("/education/delete/:id", (req, res) => {
    const deleteQuery = "DELETE FROM education WHERE id = ?";
    db.query(deleteQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error deleting education entry:", err);
            return res.status(500).send({ message: "Error deleting education entry", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Education entry not found" });
        }
        res.send({ message: "Education entry deleted successfully", affectedRows: result.affectedRows });
    });
});

// Add a new education entry
Route.post("/education/add", (req, res) => {
    const { name, description } = req.body;

    // Input validation
    if (!name || !description) {
        return res.status(400).send({ message: "Name and description are required" });
    }

    const insertQuery = "INSERT INTO education (name, description) VALUES (?, ?)";
    db.query(insertQuery, [name, description], (err, result) => {
        if (err) {
            console.error("Error adding education entry:", err);
            return res.status(500).send({ message: "Error adding education entry", error: err });
        }
        res.status(201).send({ message: "Education entry added successfully", educationId: result.insertId });
    });
});

//project manage

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });
Route.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Add a new project
Route.post('/project-manager/add', upload.single('image'), (req, res) => {
    const { name, link } = req.body;
    if (!name || !link || !req.file) {
        return res.status(400).send({ message: 'Name, link, and image are required' });
    }
    const imagePath = req.file.filename;

    const query = "INSERT INTO project_manager (name, image_path, link) VALUES (?, ?, ?)";
    db.query(query, [name, imagePath, link], (err, result) => {
        if (err) return res.status(500).send({ message: 'Error adding project manager', error: err });
        res.send({ id: result.insertId, name, image_path: imagePath, link });
    });
});

// Get all projects
Route.get('/project-manager', (req, res) => {
    const query = "SELECT * FROM project_manager";
    db.query(query, (err, results) => {
        if (err) return res.status(500).send({ message: 'Error fetching projects', error: err });
        res.send(results);
    });
});

// Get a project by ID
Route.get('/project-manager/:id', (req, res) => {
    const query = "SELECT * FROM project_manager WHERE id = ?";
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).send({ message: 'Error fetching project', error: err });
        if (results.length === 0) return res.status(404).send({ message: 'Project not found' });
        res.send(results[0]);
    });
});

// Update a project
Route.put('/project-manager/edit/:id', upload.single('image'), (req, res) => {
    const { name, link } = req.body;
    const { id } = req.params;
    let imagePath = req.file ? req.file.filename : null;

    // If no new image, keep the old image path
    if (!imagePath) {
        const selectQuery = "SELECT image_path FROM project_manager WHERE id = ?";
        db.query(selectQuery, [id], (err, result) => {
            if (err) return res.status(500).send({ message: 'Error fetching existing project', error: err });
            if (result.length === 0) return res.status(404).send({ message: 'Project not found' });

            imagePath = result[0].image_path; // Use the existing image if no new one
            const updateQuery = "UPDATE project_manager SET name = ?, image_path = ?, link = ? WHERE id = ?";
            const params = [name, imagePath, link, id];

            db.query(updateQuery, params, (err, result) => {
                if (err) return res.status(500).send({ message: 'Error updating project', error: err });
                if (result.affectedRows === 0) return res.status(404).send({ message: 'Project not found' });
                res.send({ message: 'Project updated successfully' });
            });
        });
    } else {
        // If new image is provided, update the image path
        const updateQuery = "UPDATE project_manager SET name = ?, image_path = ?, link = ? WHERE id = ?";
        const params = [name, imagePath, link, id];

        db.query(updateQuery, params, (err, result) => {
            if (err) return res.status(500).send({ message: 'Error updating project', error: err });
            if (result.affectedRows === 0) return res.status(404).send({ message: 'Project not found' });
            res.send({ message: 'Project updated successfully' });
        });
    }
});


// Delete a project
Route.delete('/project-manager/delete/:id', (req, res) => {
    const query = "DELETE FROM project_manager WHERE id = ?";
    db.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).send({ message: 'Error deleting project', error: err });
        if (result.affectedRows === 0) return res.status(404).send({ message: 'Project not found' });
        res.send({ message: 'Project deleted successfully' });
    });
});



//contact
// Add a new contact entry
Route.post("/contact/add", (req, res) => {
    const { name, email, description } = req.body;

    // Input validation
    if (!name || !email || !description) {
        return res.status(400).send({ message: "Name, email, and description are required" });
    }

    const insertQuery = "INSERT INTO contact (name, email, description, date) VALUES (?, ?, ?, NOW())";
    db.query(insertQuery, [name, email, description], (err, result) => {
        if (err) {
            console.error("Error adding contact entry:", err);
            return res.status(500).send({ message: "Error adding contact entry", error: err });
        }
        res.status(201).send({ message: "Contact entry added successfully", contactId: result.insertId });
    });
});
// Update a contact entry
Route.put("/contact/edit/:id", (req, res) => {
    const { name, email, description } = req.body;

    if (!name || !email || !description) {
        return res.status(400).send({ message: "Name, email, and description are required" });
    }

    const updateQuery = "UPDATE contact SET name = ?, email = ?, description = ?, date = NOW() WHERE id = ?";
    db.query(updateQuery, [name, email, description, req.params.id], (err, result) => {
        if (err) {
            console.error("Error updating contact entry:", err);
            return res.status(500).send({ message: "Error updating contact entry", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Contact entry not found" });
        }
        res.send({ message: "Contact entry updated successfully", affectedRows: result.affectedRows });
    });
});
Route.delete("/contact/delete/:id", (req, res) => {
    const deleteQuery = "DELETE FROM contact WHERE id = ?";
    db.query(deleteQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error deleting contact entry:", err);
            return res.status(500).send({ message: "Error deleting contact entry", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Contact entry not found" });
        }
        res.send({ message: "Contact entry deleted successfully", affectedRows: result.affectedRows });
    });
});
Route.get("/contact/:id", (req, res) => {
    const selectQuery = "SELECT * FROM contact WHERE id = ?";
    db.query(selectQuery, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error retrieving contact entry:", err);
            return res.status(500).send({ message: "Error retrieving contact entry", error: err });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: "Contact entry not found" });
        }
        res.send(result[0]);
    });
});
// Retrieve all contact entries
Route.get("/contact", (req, res) => {
    const selectQuery = "SELECT * FROM contact";
    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error("Error retrieving contact entries:", err);
            return res.status(500).send({ message: "Error retrieving contact entries", error: err });
        }
        res.send(results);
    });
});





module.exports = Route;
