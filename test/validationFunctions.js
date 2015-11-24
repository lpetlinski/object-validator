var assert = require("chai").assert,
	functions = require("./../lib/ValidationFunctions");

describe("Validation functions", function() {
	describe("Required", function() {
		it("Should be ok", function() {
			var result = functions.required("some text");
			assert.equal(false, result, "Should return false");
		});
		it("Should return error", function() {
			var result = functions.required("");
			assert.notEqual(false, result, "Should return error");
		});
	});

	describe("Match", function() {
		it("Should not validate empty data", function() {
			var result = functions.match(null, "");
			assert.equal(false, result, "Should return false");
		});

		it("Should not validate integer", function() {
			var result = functions.match(123, "");
			assert.equal(false, result, "Should return false");
		});

		it("Should not validate object", function() {
			var result = functions.match({
				a: "asd"
			}, "");
			assert.equal(false, result, "Should return false");
		});

		it("Should not validate array", function() {
			var result = functions.match([{}], "");
			assert.equal(false, result, "Should return false");
		});

		it("Should not validate boolean", function() {
			var result = functions.match(true, "");
			assert.equal(false, result, "Should return false");
		});

		it("Should validate proper string", function() {
			var result = functions.match("aaa", /\w+/i);
			assert.equal(false, result, "Should return false");
		});

		it("Should return error on improper string", function() {
			var result = functions.match("aaa", /\d+/i);
			assert.notEqual(false, result, "Should return error");
		});
	});
});