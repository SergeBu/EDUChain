const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');

Given('course {string} exists', function(courseName) {
  this.course = {
    name: courseName,
    id: 101
  };
});

When('student {string} completes the course', async function(student) {
  this.student = student;
  this.axiosStub = sinon.stub(axios, 'post').resolves({
    status: 200,
    data: { cid: 'QmBlockchain101' }
  });
  
  try {
    this.response = await axios.post('http://dummy-api/webhook', {
      user: student,
      courseId: this.course.id
    });
  } catch (error) {
    this.error = error;
  }
});

Then('NFT with CID {string} is minted', function(expectedCid) {
  expect(this.response.status).to.equal(200);
  expect(this.response.data.cid).to.equal(expectedCid);
  this.axiosStub.restore();
});