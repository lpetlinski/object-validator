var assert = require("assert");
var processor = require("./../")

describe("Simple validation", function() {
	describe("One field", function() {
		it("Should return no error", function() {
			var result = processor.process({
				a: "test"
			}, {
				a: {
					required: true
				}
			});

			assert.equal(false, result);
		});
	});
});