import { Route, Routes } from "react-router";
import Chat from "./pages/chat";
import Login from "./pages/login";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Routes>
      <Route index path="/" element={<Chat />} />
      <Route index path="/auth/login" element={<Login />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
