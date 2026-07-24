import { useState } from "react";

export default function ChildrenPage() {
  const [month, setMonth] = useState("2026-04");
  const [facility, setFacility] = useState("もりや幼保園");

  const [children, setChildren] = useState({
    age0: 0,
    age1: 0,
    age2: 0,
    age3m: 0,
    age3: 0,
    age4: 0,
    age5: 0,
  });

  const handleChange = (key, value) => {
    setChildren({
      ...children,
      [key]: Number(value),
    });
  };

  const total =
    children.age0 +
    children.age1 +
    children.age2 +
    children.age3m +
    children.age3 +
    children.age4 +
    children.age5;

  return (
    <div className="page">
      <h2>👶 園児・配置管理</h2>

      <div className="card">

        <h3>毎月の園児数</h3>

        <br />

        <label>対象月</label>
        <br />
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <br /><br />

        <label>園</label>
        <br />

        <select
          value={facility}
          onChange={(e) => setFacility(e.target.value)}
        >
          <option>もりや幼保園</option>
          <option>ひなの里幼稚園</option>
          <option>みやぞの幼稚園</option>
          <option>名都借みらい保育園</option>
          <option>もりり保育園</option>
        </select>

        <br /><br />

        <table className="table">
          <thead>
            <tr>
              <th>年齢</th>
              <th>人数</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>0歳</td>
              <td>
                <input
                  type="number"
                  value={children.age0}
                  onChange={(e)=>handleChange("age0",e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td>1歳</td>
              <td>
                <input
                  type="number"
                  value={children.age1}
                  onChange={(e)=>handleChange("age1",e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td>2歳</td>
              <td>
                <input
                  type="number"
                  value={children.age2}
                  onChange={(e)=>handleChange("age2",e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td>満3歳</td>
              <td>
                <input
                  type="number"
                  value={children.age3m}
                  onChange={(e)=>handleChange("age3m",e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td>3歳</td>
              <td>
                <input
                  type="number"
                  value={children.age3}
                  onChange={(e)=>handleChange("age3",e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td>4歳</td>
              <td>
                <input
                  type="number"
                  value={children.age4}
                  onChange={(e)=>handleChange("age4",e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td>5歳</td>
              <td>
                <input
                  type="number"
                  value={children.age5}
                  onChange={(e)=>handleChange("age5",e.target.value)}
                />
              </td>
            </tr>

          </tbody>
        </table>

        <br />

        <h3>合計園児数：{total} 名</h3>

      </div>
    </div>
  );
}