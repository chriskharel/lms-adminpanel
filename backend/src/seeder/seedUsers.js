import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function seedUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "adminlms",
  });

  const passwordHash = await bcrypt.hash("Passw0rd!", 10);

  const users = [
    ["Admin User", "admin@lms.local", passwordHash, "admin"],
    ["Instructor User", "instructor@lms.local", passwordHash, "instructor"],
    ["Student User", "student@lms.local", passwordHash, "student"],
  ];

  for (const [name, email, password_hash, role] of users) {
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length === 0) {
      await connection.execute(
        "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())",
        [name, email, password_hash, role]
      );
      console.log(`✅ Inserted: ${name} (${role})`);
    } else {
      console.log(`ℹ️ Skipped: ${email} already exists`);
    }
  }

  await connection.end();
  console.log("🎉 Seeding complete!");
}

seedUsers().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
