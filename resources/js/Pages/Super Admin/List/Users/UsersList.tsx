import Authenticated from "@/Layouts/AuthenticatedLayout";
import { format } from "date-fns";
import React, { useState, useEffect, FormEventHandler } from "react";
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

interface User {
    id: number;
    firstname: string;
    lastname: string;
    sex: string;
    status: string;
    email: string;
    pfp: string; // Profile picture URL
}

export interface PaginatedFarmers {
    data: User[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface UserProps extends PageProps {
    users: PaginatedFarmers;
}

export default function UserList({ auth, users }: UserProps) {
    const userData = users?.data || [];

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    const rows = userData.map((user: User) => ({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        sex: user.sex,
        status: user.status,
        pfp: user.pfp, // Store profile picture URL
    }));

    const columns = [
        "id",
        "firstname",
        "lastname",
        "email",
        "sex",
        "status",
        "pfp", // Column for the profile picture
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

    const closeEditModal = () => setIsUpdateModalOpen(false);

    const sex = [
        { label: "female", value: "female" },
        { label: "male", value: "male" },
    ];

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = users?.total || 0;

    const itemsPerPage = 20;

    const handlePageChange = async (page: number) => {
        setCurrentPage(page);

        try {
            const response = await axios.get(`/users?page=${page}`, {
                headers: {
                    "X-Inertia": true,
                    Accept: "application/json",
                },
            });

            const paginatedActivities = response.data;

            if (paginatedActivities && paginatedActivities.data) {
                const updatedRows = paginatedActivities.data.map(
                    (user: User) => ({
                        id: user.id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        sex: user.sex,
                        status: user.status,
                        pfp: user.pfp, // Store profile picture URL
                    })
                );

                setFilteredRows(updatedRows);
            }
        } catch (error) {
            console.error("Error fetching paginated data:", error);
        }
    };

    const handleView = (user: User) => {
        console.log(`/userprofile/${user.id}`);
        router.visit(`/userprofile/${user.id}`);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (user: User) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await router.delete(`/users/destroy/${user.id}`);
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

        if (!selectedUser) {
            return; // Ensure selectedUser is not null
        }

        try {
            await axios.patch(`/users/update/${selectedUser.id}`, {
                firstname: selectedUser.firstname,
                lastname: selectedUser.lastname,
                sex: selectedUser.sex,
                status: selectedUser.status,
            });
            toast.success("User updated successfully");
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

    const [newUser, setNewUser] = useState({
        firstname: "",
        lastname: "",
        section: "",
        sex: "",
        status: "",
    });

    const openModal = (): void => {
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        try {
            await axios.post("/users/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("User added successfully");
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
        if (!selectedUser) return;
        setSelectedUser({
            ...selectedUser,
            [e.target.name]: e.target.value,
        } as User);
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Users Management
                </h2>
            }
        >
            <Head title="Users Management" />
            <ToastContainer />

            <div className="flex justify-between mb-3">
                <div className="flex gap-5">
                    <Search onSearch={handleSearch} />
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
                Total Users: {users.total}
            </span>

            <List
                columns={columns}
                rows={filteredRows}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentPage={currentPage}
                totalItems={totalItems}
                onView={handleView}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />
            <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />
        </Authenticated>
    );
}
