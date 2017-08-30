#Color

Provide a simple class to manage and convert colors from different formats :

```ts
/**
 *  Create a red (255, 0, 0) color.
 **/
const color: Color = Color.fromHSL('hsla(0, 100%, 50%, 1)');
// Color.fromString('red');
// Color.fromRGB('rgba(255, 0, 0, 1)');
// Color.fromHex('#FF0000');
// new Color(255, 0, 0);
```

```ts
/**
 *  Convert the color to different formats
 **/
console.log(color.toRGB());
console.log(color.toHSL());
console.log(color.toHex());
```

[Full documentation](./tsdoc/index.html)