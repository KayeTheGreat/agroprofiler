import Authenticated from "@/Layouts/AuthenticatedLayout";
import { format } from "date-fns";
import React, {
    ReactNode,
    useState,
    useEffect,
    FormEventHandler,
    Suspense,
    lazy,
} from "react";
import { PageProps } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import List from "@/Components/List";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Search from "@/Components/Search";
import CheckBoxDropDown from "@/Components/CheckBoxDropDown";
import Pagination from "@/Components/Pagination";
import { Download, PlusIcon, User2 } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import axios from "axios";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";

import { createClient } from "@supabase/supabase-js";
import InputError from "@/Components/InputError";
import LazyComponent from "@/Components/LazyLoading";
import InputLabel from "@/Components/InputLabel";

const supabase = createClient(
    "https://rcwzrukrhbonsbamqdma.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjd3pydWtyaGJvbnNiYW1xZG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwNTQ5NTAsImV4cCI6MjA0NDYzMDk1MH0.Mpq-c0Rquu8pEgeQCEfhOJlWrSFj-nPuuTam9ghpf_s"
);

interface Barangay {
    id: number;
    name: string;
}

interface Farmer {
    id: number;
    rsbsa_ref_no: string;
    firstname: string;
    lastname: string;
    age: number;
    sex: string;
    status: string;
    coop: string;
    pwd: string;
    barangay: {
        id: number;
        name: string;
    };
    "4ps"?: string;
    dob: Date;
    brgy_id: number;
}
export interface PaginatedFarmers {
    data: Farmer[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface FarmerProps extends PageProps {
    farmers: PaginatedFarmers;
    barangays: Barangay[];
}

export default function FarmerList({
    auth,
    farmers,
    barangays = [],
}: FarmerProps) {
    const farmerData = farmers?.data || [];
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    const rows = farmerData.map((farmer: Farmer) => ({
        id: farmer.id,
        rsbsa_ref_no: farmer.rsbsa_ref_no,
        firstname: farmer.firstname,
        lastname: farmer.lastname,
        age: farmer.age,
        sex: farmer.sex,
        status: (
            <span
                className={`px-2 py-1 text-[11px] rounded-full ${
                    farmer.status === "registered"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                }`}
            >
                {farmer.status}
            </span>
        ),
        coop: farmer.coop,
        brgy_id: farmer.barangay?.name || "Unknown",
        pwd: farmer.pwd,
        "4ps": farmer["4ps"],
    }));

    const columns = [
        "id",
        "rsbsa_ref_no",
        "firstname",
        "lastname",
        "age",
        "sex",
        "status",
        "coop",
        "brgy",
        "pwd",
        "4ps",
    ];

    const [filteredRows, setFilteredRows] = useState(rows);

    const handleSearch = (query: string) => {
        const lowerCaseQuery = query.toLowerCase();
        const filteredData = rows.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(lowerCaseQuery)
            )
        );
        setFilteredRows(filteredData);
    };

    const closeEditModal = () => setIsEditModalOpen(false);

    const filterOptions = [
        { label: "Unregistered", value: "Unregistered" },
        { label: "Registered", value: "Registered" },
        { label: "PWD", value: "PWD" },
        { label: "4ps", value: "4ps" },
    ];

    const yearOptions = [
        { label: "2024", value: "2024" },
        { label: "2023", value: "2023" },
        { label: "2022", value: "2022" },
        { label: "2021", value: "2021" },
    ];

    const sex = [
        { label: "female", value: "female" },
        { label: "male", value: "male" },
    ];

    const [multiSelectValue, setMultiSelectValue] = useState([]);
    const [yearSelectValue, setYearSelectValue] = useState([]);
    const [sexSelectValue, setSexSelectValue] = useState([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleMultiSelectChange = (newValue: any) => {
        setMultiSelectValue(newValue);
    };
    const handleYearSelectChange = (newValue: any) => {
        setYearSelectValue(newValue);
    };
    const handleSexSelectChange = (newValue: any) => {
        setSexSelectValue(newValue);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = farmers?.total || 0;

    const itemsPerPage = 20;

    const handlePageChange = async (page: number) => {
        setCurrentPage(page);

        try {
            const response = await axios.get(`/cropactivity?page=${page}`, {
                headers: {
                    "X-Inertia": true,
                    Accept: "application/json",
                },
            });

            const paginatedActivities = response.data;

            if (paginatedActivities && paginatedActivities.data) {
                const updatedRows = paginatedActivities.data.map(
                    (farmer: Farmer) => ({
                        id: farmer.id,
                        firstname: farmer.firstname,
                        lastname: farmer.lastname,
                        age: farmer.age,
                        sex: farmer.sex,
                        status: (
                            <span
                                className={`px-2 py-1 text-[11px] rounded-full ${
                                    farmer.status === "registered"
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                }`}
                            >
                                {farmer.status}
                            </span>
                        ),
                        coop: farmer.coop,
                        brgy_id: farmer.barangay?.name || "Unknown",
                        pwd: farmer.pwd,
                        "4ps": farmer["4ps"] ? "Yes" : "No",
                    })
                );

                setFilteredRows(updatedRows);
            }
        } catch (error) {
            console.error("Error fetching paginated data:", error);
        }
    };

    const handleView = (farmer: Farmer) => {
        console.log(`/farmprofile/${farmer.id}`);
        router.visit(`/farmprofile/${farmer.id}`);
    };

    const handleEdit = (farmer: Farmer) => {
        setSelectedFarmer(farmer);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (farmer: Farmer) => {
        if (window.confirm("Are you sure you want to delete this farmer?")) {
            try {
                await router.delete(`/farmers/destroy/${farmer.id}`);
                toast.success("Farmer deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
            } catch (error) {
                toast.error("Failed to delete farmer");
            }
        }
    };

    const handleUpdate: FormEventHandler = async (e) => {
        e.preventDefault();

        if (!selectedFarmer?.dob) {
            toast.error("Date of Birth is required.");
            return;
        }

        const formattedFarmer = {
            ...selectedFarmer,
            dob: selectedFarmer.dob ? selectedFarmer.dob : null,
            brgy_id: selectedFarmer.brgy_id,
        };

        console.log("Formatted Farmer ID:", formattedFarmer.id);
        console.log(formattedFarmer);

        try {
            await axios.patch(`/farmers/update/${formattedFarmer.id}`, {
                firstname: formattedFarmer.firstname,
                lastname: formattedFarmer.lastname,
                dob: formattedFarmer.dob,
                age: formattedFarmer.age,
                sex: formattedFarmer.sex,
                status: formattedFarmer.status,
                coop: formattedFarmer.coop,
                pwd: formattedFarmer.pwd,
                "4ps": formattedFarmer["4ps"],
                brgy_id: formattedFarmer.brgy_id,
            });
            toast.success("Farmer updated successfully");
            closeModal();
        } catch (error) {
            console.error("Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                toast.error(
                    `Failed to update farmer: ${error.response.statusText}`
                );
            } else {
                toast.error("Failed to update farmer");
            }
        }
    };

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [newFarmer, setNewFarmer] = useState({
        firstname: "",
        lastname: "",
        age: "",
        sex: "",
        brgy_id: "",
        status: "",
        coop: "",
        pwd: "",
        "4ps": "",
        dob: "",
    });

    const filterRows = (status: string[], year: string[], sex: string[]) => {
        let filtered = rows;

        if (status.length > 0) {
            filtered = filtered.filter((row) =>
                status.includes(row.status.props.children)
            );
        }
        setFilteredRows(filtered);
    };

    const openModal = (): void => {
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFarmer({
            ...newFarmer,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewFarmer({
            ...newFarmer,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (!newFarmer.dob) {
            toast.error("Date of Birth is required.");
            return;
        }
        const formattedFarmer = {
            ...newFarmer,
            dob: newFarmer.dob ? newFarmer.dob : null,
        };
        const formData = new FormData();
        console.log(formattedFarmer);

        console.log("Submitting farmer data:", formattedFarmer);
        (
            Object.keys(formattedFarmer) as (keyof typeof formattedFarmer)[]
        ).forEach((key) => {
            const value = formattedFarmer[key];
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        try {
            await axios.post("/farmers/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Farmer added successfully");
            closeModal();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error("Error adding farmer:", error.response.data);
                toast.error(
                    `Failed to add farmer: ${
                        error.response.data.message || "Validation error"
                    }`
                );
            } else {
                toast.error("Failed to add farmer");
            }
        }
    };

    const handleUpdateInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!selectedFarmer) return;
        setSelectedFarmer({
            ...selectedFarmer,
            [e.target.name]: e.target.value,
        } as Farmer);
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Farmers Management
                </h2>
            }
        >
            <Head title="Farmers Management" />
            <ToastContainer />

            <div className="flex justify-between mb-3">
                <div className="flex gap-5">
                    <Search onSearch={handleSearch} />
                    <CheckBoxDropDown
                        options={filterOptions}
                        onChange={handleMultiSelectChange}
                        value={multiSelectValue}
                        placeholder="Filter"
                        isMulti={true}
                    />
                    <CheckBoxDropDown
                        options={yearOptions}
                        onChange={handleYearSelectChange}
                        value={yearSelectValue}
                        placeholder="Year"
                        isMulti={true}
                    />
                </div>
                <div className="flex gap-5">
                    <PrimaryButton className="border text-sm justify-center content-center rounded-lg align-items-center text-white align-middle">
                        <span className="flex gap-2">
                            <Download size={18} />
                            Export
                        </span>
                    </PrimaryButton>
                    <PrimaryButton
                        className="text-sm justify-center align-content-center rounded-lg text-white"
                        onClick={openModal}
                    >
                        <span className="flex gap-2">
                            <PlusIcon size={18} />
                            Add new
                        </span>
                    </PrimaryButton>
                </div>
            </div>

            <span className="text-sm text-slate-300">
                Total farmers: {farmers.total}
            </span>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-4">
                    <div className="p-2 border-b-[1px] border-slate-300 mb-2">
                        <h2 className="text-lg">Add New Farmer</h2>
                    </div>

                    <div className="mt-4">
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-5">
                                <TextInput
                                    name="firstname"
                                    value={newFarmer.firstname}
                                    onChange={handleInputChange}
                                    placeholder="Firstname"
                                />
                                <TextInput
                                    name="lastname"
                                    value={newFarmer.lastname}
                                    onChange={handleInputChange}
                                    placeholder="Lastname"
                                />
                            </div>
                            <br />
                            <div className="flex gap-5">
                                <TextInput
                                    name="age"
                                    value={newFarmer.age}
                                    onChange={handleInputChange}
                                    placeholder="Age"
                                />
                                <select
                                    name="sex"
                                    value={newFarmer.sex}
                                    onChange={handleSelectChange}
                                    className="rounded-lg border-gray-300"
                                >
                                    <option value="" disabled>
                                        Select Sex
                                    </option>
                                    {sex.map((sexOption) => (
                                        <option
                                            key={sexOption.value}
                                            value={sexOption.value}
                                        >
                                            {sexOption.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <br />
                            <div className="flex gap-5">
                                <select
                                    name="brgy_id"
                                    value={newFarmer.brgy_id}
                                    onChange={handleSelectChange}
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="">Barangay</option>
                                    {barangays.map((barangay) => (
                                        <option
                                            key={barangay.id}
                                            value={barangay.id}
                                        >
                                            {barangay.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="4ps"
                                    value={newFarmer["4ps"]}
                                    onChange={handleSelectChange}
                                    className=" w-full rounded-lg border-gray-300"
                                >
                                    <option value="">Is 4Ps?</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>

                                <select
                                    name="pwd"
                                    value={newFarmer.pwd}
                                    onChange={handleSelectChange}
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="" disabled>
                                        Is PWD?
                                    </option>

                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <br />
                            <div>
                                <input
                                    type="date"
                                    id="dob"
                                    name="dob"
                                    value={newFarmer.dob}
                                    onChange={(e) =>
                                        setNewFarmer({
                                            ...newFarmer,
                                            dob: "1990-01-01",
                                        })
                                    }
                                    className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                    required
                                />
                                <br />
                                <select
                                    name="status"
                                    value={newFarmer.status}
                                    onChange={handleSelectChange}
                                    className="mt-3 w-full rounded-lg border-gray-300"
                                >
                                    <option value="" disabled>
                                        Status
                                    </option>
                                    <option value="registered">
                                        Registered
                                    </option>
                                    <option value="unregistered">
                                        Unregistered
                                    </option>
                                </select>
                                <br />
                                <input
                                    type="text"
                                    id="coop"
                                    name="coop"
                                    placeholder="coop"
                                    value={newFarmer.coop}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                />
                            </div>

                            <div className="p-4 mt-4 border-t border-slate-300">
                                <PrimaryButton onClick={handleSubmit}>
                                    Submit
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
            <div>
                <List
                    columns={columns}
                    rows={filteredRows}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            </div>

            {selectedFarmer && (
                <Modal show={isEditModalOpen} onClose={closeEditModal}>
                    <div className="p-4">
                        <div className="p-2 border-b-[1px] border-slate-300 mb-4">
                            <h2 className="text-lg mb-2">Edit Farmer</h2>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="flex gap-5 mb-4">
                                <div>
                                    <InputLabel
                                        value="First Name"
                                        htmlFor="firstName"
                                        className="mb-2"
                                    />
                                    <TextInput
                                        name="firstname"
                                        value={selectedFarmer.firstname}
                                        onChange={handleUpdateInputChange}
                                        placeholder="Firstname"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        value="Last Name"
                                        htmlFor="lastName"
                                        className="mb-2"
                                    />
                                    <TextInput
                                        name="lastname"
                                        value={selectedFarmer.lastname}
                                        onChange={handleUpdateInputChange}
                                        placeholder="Lastname"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-5 mb-4">
                                <div>
                                    <InputLabel
                                        value="Age"
                                        htmlFor="age"
                                        className="mb-2"
                                    />
                                    <TextInput
                                        name="age"
                                        value={selectedFarmer.age}
                                        onChange={handleUpdateInputChange}
                                        placeholder="Age"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        value="Coop"
                                        htmlFor="coop"
                                        className="mb-2"
                                    />
                                    <input
                                        type="text"
                                        id="coop"
                                        name="coop"
                                        placeholder="coop"
                                        value={selectedFarmer.coop}
                                        onChange={handleUpdateInputChange}
                                        className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <InputLabel value="Sex" htmlFor="sex" />
                                    <select
                                        name="sex"
                                        className="w-[200px] mt-3 rounded-lg border-gray-300"
                                        value={selectedFarmer.sex}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                sex: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select Sex</option>
                                        {sex.map((sexOption) => (
                                            <option
                                                key={sexOption.value}
                                                value={sexOption.value}
                                            >
                                                {sexOption.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel
                                        value="Barangay"
                                        htmlFor="barangay"
                                    />
                                    <select
                                        name="brgy_id"
                                        value={
                                            selectedFarmer.barangay?.name || ""
                                        }
                                        onChange={(e) => {
                                            const barangayId = Number(
                                                e.target.value
                                            );
                                            const selectedBarangay =
                                                barangays.find(
                                                    (b) => b.id === barangayId
                                                );
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                barangay: selectedBarangay || {
                                                    id: 0,
                                                    name: "Unknown",
                                                },
                                            });
                                        }}
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="" disabled>
                                            Barangay
                                        </option>
                                        {barangays.map((barangay) => (
                                            <option
                                                key={barangay.id}
                                                value={barangay.id}
                                            >
                                                {barangay.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <div>
                                    <InputLabel value="Is 4ps?" htmlFor="4ps" />
                                    <select
                                        name="4ps"
                                        value={selectedFarmer["4ps"]}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                "4ps": e.target.value,
                                            })
                                        }
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="" disabled>
                                            Is 4Ps?
                                        </option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel value="Is PWD?" htmlFor="pwd" />
                                    <select
                                        name="pwd"
                                        value={selectedFarmer.pwd}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                pwd: e.target.value,
                                            })
                                        }
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="" disabled>
                                            Is PWD?
                                        </option>

                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <InputLabel
                                        value="Birthdate"
                                        htmlFor="dob"
                                    />
                                    <input
                                        type="date"
                                        id="dob"
                                        name="dob"
                                        value={
                                            selectedFarmer.dob
                                                ? format(
                                                      new Date(
                                                          selectedFarmer.dob
                                                      ),
                                                      "yyyy-MM-dd"
                                                  )
                                                : ""
                                        }
                                        onChange={handleUpdateInputChange}
                                        className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <InputLabel value="status" htmlFor="dob" />
                                    <select
                                        name="status"
                                        value={selectedFarmer.status}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                status: e.target.value,
                                            })
                                        }
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="">Status</option>
                                        <option value="registered">
                                            Registered
                                        </option>
                                        <option value="unregistered">
                                            Unregistered
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 mt-4 border-t border-slate-300">
                                <PrimaryButton type="submit">
                                    Update
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </Authenticated>
    );
}
