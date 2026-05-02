import { Server } from "http";
import app from "./app";
import { seedAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";

let server: Server 
const bootStrap = async () => {
    try {
        await seedAdmin();
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        console.log("Failed to start server", error)
    }
}

// SIGTERM signal handler
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Shutting down server...");

    if(server){
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(1);
        });
    } 
    
    process.exit(1);
    
})

// SIGINT signal handler

process.on("SIGINT", () => {
    console.log("SIGINT signal received. Shutting down server...");

    if(server){
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(1);
        });

    }

    process.exit(1);
});

// uncaught exeption handler
process.on('uncaughtException', (error) => {
    console.log("Uncaught Exception Detected... Shutting down server", error);

    if(server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
})

// unhandled rejection handler
process.on('unhandledRejection', (error) => {
    console.log("Unhandled Rejection Detected... Shutting down server", error);

    if(server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
})

bootStrap();
