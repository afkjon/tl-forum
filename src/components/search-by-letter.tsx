import Link from "next/link";

const SearchByLetter = () => {
  const path = window.location.href;
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
  const hiragana = [["あ", "a"], ["か", "k"], ["さ", "s"], ["た", "t"], ["は", "h"], ["ま", "m"], ["や", "y"], ["ら", "r"], ["わ", "w"], ["ん", "n"]]
  return (
    <>
      <div className="flex justify-center">
        <ul className="mx-auto flex gap-3 m-2">
          <li>{`<`}</li>
          {letters.map(letter => {
            let styles = "";

            if (path.includes(`category/sfx/${letter}`))
              styles = "text-red-500";

            return (
              <>
                {letter ?
                  <li key={letter}
                    className={styles}
                  >
                    <Link href={`/category/sfx/${letter}`}>
                      {letter}
                    </Link>
                  </li>
                  : null}
              </>
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
            let styles = "";
            if (romaji && path.includes(`category/sfx/${romaji}`))
              styles = "text-red-500";

            return (
              <>
                {romaji ?
                  <li key={romaji}
                    className={styles}
                  >
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