import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Create from "./pages/Create";

export default function App() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "#0b0e14",
    color: "white",
    padding: 24,
    boxSizing: "border-box"
  },
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto"
  }
};