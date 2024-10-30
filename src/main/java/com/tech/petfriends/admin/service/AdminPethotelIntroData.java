package com.tech.petfriends.admin.service;

import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import com.tech.petfriends.admin.mapper.AdminPageDao;
import com.tech.petfriends.helppetf.dto.PethotelIntroDto;

@Service
public class AdminPethotelIntroData implements AdminServiceInterface {
	
	AdminPageDao adminDao;
	
	public AdminPethotelIntroData(AdminPageDao adminDao) {
		this.adminDao = adminDao;
	}
	
	@Override
	public void execute(Model model) {
		PethotelIntroDto dto = adminDao.adminPethotelIntro();
		model.addAttribute("dto", dto);
	}
}