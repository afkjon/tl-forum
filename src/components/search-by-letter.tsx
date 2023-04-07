import Link from "next/link";

const SearchByLetter = () => {
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
  const hiragana = [["あ", "a"], ["か", "k"], ["さ", "s"], ["た", "t"], ["は", "h"], ["ま", "m"], ["や", "y"], ["ら", "r"], ["わ", "w"], ["ん", "n"]]
  return (
    <>
      <div className="flex justify-center">
        <ul className="mx-auto flex gap-3 m-2">
          <li>{`<`}</li>
          {letters.map(letter => {
            return (
              <li key={letter}>
                <Link href={`/category/sfx/${letter}`}>
                  {letter}
                </Link>
              </li>
            )
          })}
          <li>{`>`}</li>
        </ul>
      </div>
      <div className="flex justify-center">
        <ul className="mx-auto flex gap-3 m-2">
          <li>{`<`}</li>
          {hiragana ? hiragana.map(h => {
            const romaji = h.at(1);
            return (
              <>
                {romaji ?
                  <li key={romaji}>
                    <Link href={`/category/sfx/${romaji}`}>
                      {h.at(0)}
                    </Link>
                  </li>
                  : null}
              </>
            )
          }) : null}
          <li>{`>`}</li>
        </ul>
      </div>
    </>
  );
}

export default SearchByLetter;