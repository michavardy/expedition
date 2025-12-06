import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { db } from "../src/sqlClient.ts";

describe("SQLClient Tests", () => {
  const testKey1 = "user1";
  const testData1 = { name: "Alice", age: 25 };

  const testKey2 = "user2";
  const testData2 = { name: "Bob", age: 30 };

  // Reset DB before each test
  beforeEach(() => {
    db.removeAll();
  });

  afterAll(() => {
    db.close();
  });

  it("should write and read data", () => {
    db.write(testKey1, testData1);
    db.write(testKey2, testData2);

    expect(db.read(testKey1)).toEqual(testData1);
    expect(db.read(testKey2)).toEqual(testData2);
  });

  it("should remove a single key", () => {
    db.write(testKey1, testData1);
    db.remove(testKey1);

    expect(db.read(testKey1)).toBeNull();
  });

  it("should remove all keys", () => {
    db.write(testKey1, testData1);
    db.write(testKey2, testData2);
    db.removeAll();

    expect(db.read(testKey1)).toBeNull();
    expect(db.read(testKey2)).toBeNull();
  });
});
