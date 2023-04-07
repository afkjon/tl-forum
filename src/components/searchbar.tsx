import { useRouter } from "next/router";
import { type FunctionComponent, useState } from "react";


const SearchBar : FunctionComponent<{styles: string}> = ({styles}) => {
  const [input, setInput] = useState("");
  const router = useRouter();
  const handleSubmit = () => router.push(`/search/${input}`);
  
  return (
    <input
      className={styles}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleSubmit}
      placeholder="Search"
      type="text"
    />
  )
}

export default SearchBar