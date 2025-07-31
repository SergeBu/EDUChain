package com.educhain.dto;

public class NftRequest {
    private String studentWallet;
    private String courseId;

    // Геттеры и сеттеры
    public String getStudentWallet() {
        return studentWallet;
    }

    public void setStudentWallet(String studentWallet) {
        this.studentWallet = studentWallet;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }
}