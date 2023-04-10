import { useRouter } from "next/router";
import { type FunctionComponent, useState } from "react";


const SearchBar : FunctionComponent<{styles: string}> = ({styles}) => {
  const [input, setInput] = useState("");
  const router = useRouter();
  const handleSubmit = () => void router.push(`/search/${input}`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }
  
  return (
    <input
      className={styles}
      value={input}
      onChange={handleInputChange}
      onKeyDown={handleSubmit}
      placeholder="Search"
      type="text"
    />
  )
}

export default SearchBar