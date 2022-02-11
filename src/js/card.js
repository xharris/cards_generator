import React from "react";
import { ClassNames } from "@emotion/react";
import { CARD } from "../App";

const image = (type, name, src) =>
  src
    ? `${process.env.PUBLIC_URL}/${type}/${name}.png?${performance.now()}`
    : `url("${
        process.env.PUBLIC_URL
      }/${type}/${name}.png?${performance.now()}")`;

const Card = ({ type, level: _level, name, art, descr, flavor, back }) => {
  const level = parseInt(_level);
  const Level = ({ stars, noSign }) => (
    <>
      {type === "project"
        ? level
        : level > 0 && stars
        ? new Array(level).fill(0).map((_, i) => (
            <div key={i} style={{ fontSize: 17 }}>
              ★
            </div>
          ))
        : `${noSign || level === 0 ? "" : level < 0 ? "-" : "+"}`}
      ${`${Math.abs(level)}`}
    </>
  );

  const level_color =
    level === 0 || type === "project"
      ? "#F5F5F5"
      : level < 0
      ? "#f44336"
      : "#4CAF50";
  return (
    <ClassNames>
      {({ css, cx }) => (
        <div
          className={cx(
            "card",
            css({
              background: back ? "#37474f" : CARD[type].color,
              padding: back && 0,
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
                      textShadow: `1px 1px ${level_color}, 1px 0px ${level_color},  -1px 0px #F5F5F5, -1px -1px #F5F5F5`,
                      lineHeight: "20px",
                      display: "flex",
                      alignItems: "center",
                    })
                  )}
                >
                  <Level noSign />
                </div>
                <div className="card--name">{name}</div>
                <div className="card--type">
                  {type !== "default" && (
                    <img src={image("type", type, true)} alt={type} />
                  )}
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
                        ),
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
  );
};

export default Card;
