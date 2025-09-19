export type ShippingTypeItemCategoryResponse = {
	id?: string;
	name?: string;
	reference?: string;
	goods_type?: string;
	attachment?: string;
	is_active?: number;
};

export type WebTypeResp = {
	articleId?:string;
	ratings?:string;
	title?:string;
	description?:string;
	author?:string;
	is_active?:string;
};

export type Meta = {
	total?: number;
};

export type GuidelineType = {
	guidanceId: number;
	title:string;
	description: string;
	category:string;
	priority:string;
	relatedTo:string;
};


export type ShippingTypeModifiedData = {

};

export type VehicleResp = {
	id: number;
	make: string;
	model: string;
	yearOfManufacture: number;
	color: string;
	engineCapacity: string;
	fuelType: string;
	seatingCapacity: number;
	vehicleType: string;
	registrationNumber: string;
	licensePlateNumber: string;
	chassisNumber: string;
	permitType: string;
	ownerName: string;
	ownerContact: string;
	ownerAddress: string;
	insuranceProvider: string;
	insurancePolicyNumber: string;
	insuranceExpiryDate: string;
	airConditioning: boolean;
	additionalFeatures: string;
	vehicleImage: string;
	vehiclePhoto: string;
};

export type GuideType = {
	id: number;
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	employeeCode: string;
	designation: string;
	department: string;
	employmentStatus: string;
	workMode: string;
	currentSalary: number;
	hourlyRate: number;
	joinDate: string;
	contractStartDate: string;
	contractEndDate: string;
	probationEndDate: string;
	dateOfBirth: string;
	nationalId: string;
	taxId: string;
	phoneNumber: string;
	emergencyContactName: string;
	emergencyContactPhone: string;
	address: string;
	officeLocation: string;
	bankName: string;
	bankAccountNumber: string;
	previousExperienceYears: number;
	educationLevel: string;
	university: string;
	graduationYear: number;
	internDurationMonths: number;
	certifications: string;
	specialization: string;
	notes: string;
	accessLevel: string;
	managerId: number;
	mentorId: number;
	teamSize: number;
	budgetAuthority: number;
	salesTarget: number;
	commissionRate: number;
	createdAt: string;
	updatedAt: string;
	user_profile_pic: string | null;
	shiftTimings: string;
	isActive?: boolean;
};

