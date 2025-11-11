import app from "./app.js";
import dotenv from "dotenv";
import seedAdmin from "./config/seedAdmin.js";
import ensureSchema from "./config/ensureSchema.js";

dotenv.config();

const port = process.env.PORT || 4000;

(async () => {
  try {
    await ensureSchema();
    await seedAdmin();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed seeding admin:", e.message);
  }
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
})();


