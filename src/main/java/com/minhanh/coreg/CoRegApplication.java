package com.minhanh.coreg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.rmi.RemoteException;

@SpringBootApplication
public class CoRegApplication {
	
	public static void main(String[] args) throws RemoteException {
		SpringApplication.run(CoRegApplication.class, args);
	}
}
