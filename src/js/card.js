import React from "react"
import { ClassNames } from "@emotion/react"

const image = (type, name, src) =>
  src
    ? `${process.env.PUBLIC_URL}/${type}/${name}.png?${performance.now()}`
    : `url("${
        process.env.PUBLIC_URL
      }/${type}/${name}.png?${performance.now()}")`

const Card = ({ type, level: _level, name, art, descr, flavor, back }) => {
  const level = parseInt(_level)
  const Level = () => (
    <>
      {`${level === 0 ? "" : level < 0 ? "-" : "+"}`}${`${Math.abs(level)}`}
    </>
  )

  const level_color =
    level === 0 ? "#F5F5F5" : level < 0 ? "#f44336" : "#4CAF50"
  return (
    <ClassNames>
      {({ css, cx }) => (
        <div
          className={cx(
            "card",
            css({
              background: back
                ? "#37474f"
                : type === "bird"
                ? "#0D47A1"
                : type === "field"
                ? "#006064"
                : "#37474f",
              padding: back && 0
            })
          )}
        >
          {back ? (
            <img className="card--back" src={image("assets", "back", true)} />
          ) : (
            <div className="card--inner">
              <div className="card--header">
                <div
                  className={cx(
                    "card--level",
                    css({
                      textShadow: `1px 1px ${level_color}, 1px 0px ${level_color},  -1px 0px #F5F5F5, -1px -1px #F5F5F5`
                    })
                  )}
                >
                  <Level />
                </div>
                <div className="card--name">{name}</div>
                <div className="card--type">
                  {type && <img src={image("type", type, true)} alt={type} />}
                </div>
              </div>
              <div className="card--body">
                <div
                  className={cx(
                    "card--art",
                    css({
                      backgroundImage:
                        (art || name) &&
                        image(
                          "art",
                          !art || art.length === 0
                            ? name.toLowerCase().replace(/\s/g, "_")
                            : art
                        )
                    })
                  )}
                />
                {descr && <div className="card--description">{descr}</div>}
                {flavor && (
                  <div
                    className={cx(
                      "card--flavor",
                      !descr && "card--only-flavor"
                    )}
                  >
                    {`"${flavor}"`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </ClassNames>
  )
}

export default Card
