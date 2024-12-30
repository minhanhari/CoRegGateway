package com.minhanh.coreggateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;

import java.util.Map;

@RestController
public class ApplicationController{
	private static final String REQUESTS_ENDPOINT = "/graph?genes={genes}&coregulation={coregulation}";

	@Value("${backend.url}")
	private String backendUrl;

	@GetMapping("/")
	public ModelAndView rootView() {
		ModelAndView mav = new ModelAndView();
		mav.setViewName("index");
		return mav;
	}

	@GetMapping("/search")
	public ModelAndView createGraph() {
		ModelAndView mav = new ModelAndView();
		mav.setViewName("search");
		return mav;
	}

	@GetMapping(value = "/graph", produces = "application/json")
	public String getCoregulation(@RequestParam Map<String,String> allParams) {
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> response = restTemplate.getForEntity(backendUrl + REQUESTS_ENDPOINT, String.class, allParams);
		return response.getBody();
	}
}
