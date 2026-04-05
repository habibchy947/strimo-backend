import app from "./app";
import { seedAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";

const bootStrap = async () => {
    try {
        await seedAdmin();
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        console.log("Failed to start server", error)
    }
}

bootStrap();
