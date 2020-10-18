import Container from "./Container";

describe("Hello function", () => {
  let di: Container;

  beforeEach(() => {
    di = new Container();
  });

  it("should keep scalar value", () => {
    const value = 123;
    di.set("my.value", value);
    expect(di.get("my.value")).toEqual(value);
  });

  it("should throw error if try to override value by id", () => {
    let error = false;

    di.set("my.value", 123);
    try {
      di.set("my.value", 456);
    } catch (ex) {
      error = ex;
    }

    expect(error).not.toBeFalsy();
  });

  it("should throw error if value by id not set", () => {
    let error = false;

    try {
      di.get("my.value");
    } catch (ex) {
      error = ex;
    }

    expect(error).not.toBeFalsy();
  });

  it("should not throw error if value by id was unset", () => {
    di.set("my.value", 123);
    di.unset("my.value");
    di.set("my.value", 456);

    expect(di.get("my.value")).toBe(456);
  });

  it("should work with factory function", function () {
    const name = "my.factory.function";
    const value = { foo: "bar" };
    let counter = 0;
    di.set(name, function (c: Container) {
      expect(c).toEqual(di);
      ++counter;
      return value;
    });

    expect(counter).toEqual(0);
    expect(di.get(name)).toEqual(value);
    expect(counter).toEqual(1);
    di.get(name);
    expect(counter).toEqual(1);
  });

  it("should call factory function, if called with forceRecreate flag", function () {
    const name = "my.factory.function";
    const values = [{ foo: "bar" }, { bar: "baz" }];
    let counter = 0;
    di.set(
      name,
      function (c: Container) {
        expect(c).toEqual(di);
        return values[counter++];
      },
      { createEveryTime: false }
    );

    expect(di.get(name, true)).toEqual(values[0]);
    expect(di.get(name, true)).toEqual(values[1]);
  });

  it("should use default createEveryTime value if options with broken type", function () {
    const name = "my.factory.function";
    const value = { foo: "bar" };
    let counter = 0;
    di.set(
      name,
      function (c: Container) {
        ++counter;
        expect(c).toEqual(di);
        return value;
      },
      null
    );

    expect(counter).toEqual(0);
    expect(di.get(name)).toEqual(value);
    expect(counter).toEqual(1);
    di.get(name);
    expect(counter).toEqual(1);
  });

  it("should use default createEveryTime value if options without some values", function () {
    const name = "my.factory.function";
    const value = { foo: "bar" };
    let counter = 0;
    di.set(
      name,
      function (c: Container) {
        ++counter;
        expect(c).toEqual(di);
        return value;
      },
      {}
    );

    expect(counter).toEqual(0);
    expect(di.get(name)).toEqual(value);
    expect(counter).toEqual(1);
    di.get(name);
    expect(counter).toEqual(1);
  });

  it("should call factory function, if marked as createEveryTime", function () {
    const name = "my.factory.function";
    const values = [{ foo: "bar" }, { bar: "baz" }];
    let counter = 0;
    di.set(
      name,
      function (c) {
        expect(c).toEqual(di);
        return values[counter++];
      },
      { createEveryTime: true }
    );

    expect(di.get(name)).toEqual(values[0]);
    expect(di.get(name)).toEqual(values[1]);
  });
});
