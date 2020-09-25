import { g } from "gelerator";

const num2PadNumArr = (num, len) => {
  const padLeftStr = (rawStr, lenNum) =>
    rawStr.length < lenNum ? padLeftStr("0" + rawStr, lenNum) : rawStr;
  const str2NumArr = (rawStr) => rawStr.split("").map(Number);
  return str2NumArr(padLeftStr(num.toString(), len)).reverse();
};

const isstr = (any) =>
  Object.prototype.toString.call(any) === "[object String]";

export class Flip {
  constructor({
    node,
    from = 0,
    to,
    duration = 0.5,
    delay,
    easeFn = (pos) =>
      (pos /= 0.5) < 1
        ? 0.5 * Math.pow(pos, 3)
        : 0.5 * (Math.pow(pos - 2, 3) + 2),
    systemArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    direct = true
  }) {
    this.beforeArr = [];
    this.afterArr = [];
    this.ctnrArr = [];
    this.commaArr = [];
    this.duration = duration * 1000;
    this.systemArr = systemArr;
    this.easeFn = easeFn;
    this.from = from;
    this.to = to || 0;
    this.node = node;
    this.direct = direct;
    this._initHTML(11);
    if (to === undefined) return;
    if (delay) setTimeout(() => this.flipTo({ to: this.to }), delay * 1000);
    else this.flipTo({ to: this.to });
  }

  _initHTML(digits) {
    this.node.classList.add("number-flip");
    this.node.style.position = "relative";
    this.node.style.overflow = "hidden";

    for (let i = 0; i < digits; i += 1) {
      const ctnr = g(`ctnr ctnr${i}`)(
        ...this.systemArr.map((i) => g("digit")(i)),
        g("digit")(this.systemArr[0])
      );
      ctnr.style.position = "relative";
      ctnr.style.display = "inline-block";
      ctnr.style.verticalAlign = "top";
      this.ctnrArr.unshift(ctnr);
      this.node.appendChild(ctnr);
      this.beforeArr.push(0);

      if (i === 2) {
        const comma1 = g("comma1")(",");
        comma1.style.display = "inline-block";
        this.commaArr.unshift(comma1);
        this.node.appendChild(comma1);
      }
      if (i === 5) {
        const comma2 = g("comma2")(",");
        comma2.style.display = "inline-block";
        this.node.appendChild(comma2);
        this.commaArr.unshift(comma2);
      }
      if (i === 8) {
        const dot = g("dot")(".");
        dot.style.display = "inline-block";
        this.node.appendChild(dot);
      }
    }

    const resize = () => {
      this.height = this.ctnrArr[0].clientHeight / (this.systemArr.length + 1);
      this.node.style.height = this.height + "px";
      if (this.afterArr.length) this.frame(1);
      else
        for (let d = 0, len = this.ctnrArr.length; d < len; d += 1)
          this._draw({
            digit: d,
            per: 1,
            alter: ~~(this.from / Math.pow(10, d))
          });
    };
    this.hide(this.from)
    resize();

    window.addEventListener("resize", resize);
  }
  hide(to) {
    for (let i = 10; i > -1; i--) {
      var hide = false;
      if (to < 10 ** i) {
        hide = true;
        this.ctnrArr[i].style.display = "none";
        console.log("Hiding digit " + i);
      } else if (this.ctnrArr[i].style.display === "none") {
        this.ctnrArr[i].style.display = "inline-block";
        console.log("Showing digit " + i);
      }
      if (i === 8 && hide) {
        this.commaArr[1].style.display = "none";
        console.log("Hiding comma 1");
      } else if (i === 8 && this.commaArr[1].style.display === "none") {
        this.commaArr[1].style.display = "inline-block";
      }

      if (i === 5 && hide) {
        this.commaArr[0].style.display = "none";
        console.log("Hiding comma 1");
      } else if (i === 5 && this.commaArr[1].style.display === "none") {
        this.commaArr[0].style.display = "inline-block";
      }
    }
  }

  _draw({ per, alter, digit }) {
    const newHeight =
      this.ctnrArr[0].clientHeight / (this.systemArr.length + 1);
    if (newHeight && this.height !== newHeight) this.height = newHeight;
    const from = this.beforeArr[digit];
    const modNum = (((per * alter + from) % 10) + 10) % 10;
    const translateY = `translateY(${-modNum * this.height}px)`;
    this.ctnrArr[digit].style.webkitTransform = translateY;
    this.ctnrArr[digit].style.transform = translateY;
  }

  frame(per) {
    let temp = 0;
    for (let d = this.ctnrArr.length - 1; d >= 0; d -= 1) {
      let alter = this.afterArr[d] - this.beforeArr[d];
      temp += alter;
      this._draw({
        digit: d,
        per: this.easeFn(per),
        alter: this.direct ? alter : temp
      });
      temp *= 10;
    }
  }

  flipTo({ to, duration, easeFn, direct }) {
    if (easeFn) this.easeFn = easeFn;
    if (direct !== undefined) this.direct = direct;
    const len = this.ctnrArr.length;
    this.beforeArr = num2PadNumArr(this.from, len);
    this.afterArr = num2PadNumArr(to, len);
    const start = Date.now();
    const dur = duration * 1000 || this.duration;
    const tick = () => {
      let elapsed = Date.now() - start;
      this.frame(elapsed / dur);
      if (elapsed < dur) requestAnimationFrame(tick);
      else {
        this.from = to;
        this.frame(1);
      }
    };
    requestAnimationFrame(tick);
    console.log(to);
    this.hide(to);
  }
}
