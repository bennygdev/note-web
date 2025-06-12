import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [array, setArray] = useState([]);

  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8080/api");
    setArray(response.data.fruits);
    console.log(response.data.fruits);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      {array.map((fruit, index) => {
        return (
          <div key={index}>
            <p>{fruit}</p>

            <br />
          </div>
        );
      })}
    </>
  );
}

export default App
