import app from "./app";

const bootStrap = () => {
    try {
        app.listen(5000, () => {
            console.log(`Server is running on http://localhost:${5000}`);
        });
    } catch (error) {
        console.log("Failed to start server", error)
    }
}

bootStrap();
