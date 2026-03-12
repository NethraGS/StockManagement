package com.wealthpulse.dto;

public class FooterDto {

    private String companyName;
    private String gstNumber;
    private String sebiRegistration;
    private String address;
    private String email;
    private String phone;
    private String copyright;

    public FooterDto() {}

    public FooterDto(String companyName, String gstNumber, String sebiRegistration,
                     String address, String email, String phone, String copyright) {
        this.companyName = companyName;
        this.gstNumber = gstNumber;
        this.sebiRegistration = sebiRegistration;
        this.address = address;
        this.email = email;
        this.phone = phone;
        this.copyright = copyright;
    }

    public String getCompanyName() { return companyName; }
    public String getGstNumber() { return gstNumber; }
    public String getSebiRegistration() { return sebiRegistration; }
    public String getAddress() { return address; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getCopyright() { return copyright; }
}