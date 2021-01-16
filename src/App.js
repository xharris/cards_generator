import React, { useState } from "react"
import Card from "src/js/card"
import cards from "src/cards.json"
import { join } from "path"
import { writeFile } from "fs-extra"
import "style/index.scss"

const App = () => {
  const card_list = Object.keys(cards).reduce(
    (arr, c) => arr.concat({ archetype: c }, cards[c]),
    []
  )
  const [focusCard, setFocusCard] = useState(card_list[1])

  return (
    <div className="App">
      <div className="cardview-header">
        <select
          className="card-select"
          value={focusCard.name}
          onChange={e =>
            setFocusCard(card_list.filter(c => c.name === e.target.value)[0])
          }
        >
          {card_list.map(c =>
            c.archetype ? (
              <option key={c.archetype} disabled>
                {`--- ${c.archetype} ---`}
              </option>
            ) : (
              <option key={c.name} value={c.name}>
                {`${c.name} (${c.type.slice(0, 1).toUpperCase()})`}
              </option>
            )
          )}
        </select>
        <button>Add</button>
        <button>Remove</button>
      </div>
      {focusCard && (
        <div className="cardview">
          <Card key={focusCard.name} {...focusCard} />
          <form
            className="cardview-inputs"
            onChange={e =>
              setFocusCard({ ...focusCard, [e.target.name]: e.target.value })
            }
            onSubmit={e => {
              const new_cards = JSON.parse(JSON.stringify(cards))
              Object.keys(new_cards).forEach(arch => {
                new_cards[arch] = new_cards[arch].map(card =>
                  card.name === focusCard.name ? focusCard : card
                )
              })
              writeFile(
                join("src", "cards.json"),
                JSON.stringify(new_cards)
              ).then(() => console.log("done saving"))
              e.preventDefault()
            }}
          >
            <input name="name" defaultValue={focusCard.name} />
            <input name="level" type="number" defaultValue={focusCard.level} />
            <select
              name="type"
              key={focusCard.type}
              defaultValue={focusCard.type}
            >
              {["bird", "action", "quick", "field"].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input name="descr" defaultValue={focusCard.descr} />
            <button type="submit">Save</button>
          </form>
        </div>
      )}
      <div className="small-cards">
        {card_list.map(c =>
          c.archetype ? (
            <div key={c.archetype} className="card-archetype">
              {c.archetype}
            </div>
          ) : (
            <div
              key={c.name}
              className="card-wrapper"
              title={c.name}
              onClick={() => setFocusCard(c)}
            >
              <Card {...c} />
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default App
