export async function login({ email, password }: { email: string; password: string }) {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      throw new Error("Error de conexión");
    }
  }
  